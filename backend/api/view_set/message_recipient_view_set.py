"""
Handles API requests regarding message recipient data:
- creating entries - adding another recipient to the message (requires being the manager or the moderator of the group)
- marking a message as read (requires being the recipient)
- getting all messages sent to the calling user
Staff users can do all of the above + list all message recipients or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import MessageRecipient, Message, User
from api.serializers import MessageRecipientSerializer
from api.permissions.message_recipient_permissions import CanViewMessageRecipient, CanCreateMessageRecipient, CanMarkAsRead


class MessageRecipientViewSet(viewsets.ModelViewSet):
    queryset = MessageRecipient.objects.all().select_related("message", "user")
    serializer_class = MessageRecipientSerializer
    permission_classes = [IsAuthenticated, CanViewMessageRecipient, CanCreateMessageRecipient, CanMarkAsRead]
    http_method_names = ["get", "post", "head"]

    @staticmethod
    def is_member(request):
        message = Message.objects.get(message_id=request.data.get("message"))
        user = User.objects.get(user_id=request.data.get("user"))
        return user.group_memberships.filter(group_id=message.group_id).exists()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid() or not self.is_member(request) or request.data.get("is_read") is not False:
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        message_recipient = self.get_object()
        message_recipient.is_read = True
        message_recipient.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def me(self, request):
        received_messages = MessageRecipient.objects.filter(user=request.user).select_related("message", "user")
        serializer = self.get_serializer(received_messages, many=True)
        return Response(serializer.data)
