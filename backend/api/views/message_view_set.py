"""
Handles API requests regarding message data:
- creating messages (requires being the manager or the moderator of the group)
- getting all messages of a group sent to the calling user
Staff users can do all of the above + list all messages or a specific one.
"""

from django.conf import settings
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Message, MessageRecipient, Member, User
from api.serializers import MessageSerializer
from api.permissions.message_permissions import MessagePermission


def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().select_related("group", "user")
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, MessagePermission]
    http_method_names = ["get", "post", "head"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            if not serializer.is_valid() or str(request.user.user_id) != str(request.data.get("user")):
                raise Exception("Data validation failed")
            message = serializer.save()

            recipient_ids = [int(user_id) for user_id in request.GET.getlist("id")]
            recipients = [User.objects.get(user_id=user_id) for user_id in recipient_ids]
            if len(recipients) == 0:
                raise Exception("Message must have at least one recipient")

            # check if all recipients are group members, otherwise throws exception
            for user in recipients:
                Member.objects.get(group=message.group, user=user)

            for user in recipients:
                recipient = MessageRecipient.objects.create(
                    message=message,
                    user=user,
                    is_read=False,
                )
                recipient.save()

            emails = [user.email for user in recipients if is_valid_email(user.email)]
            send_mail(subject=message.title, message=message.content, from_email=settings.EMAIL_HOST_USER, recipient_list=emails)

            return Response(data=serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(data={"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def by_group(self, request):
        recipients = MessageRecipient.objects.filter(user_id=request.user.user_id).select_related("message", "message__group", "message__user")
        messages = [r.message for r in recipients if str(r.message.group_id) == request.GET.get("group_id")]
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
