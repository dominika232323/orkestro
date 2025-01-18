"""
Handles API requests regarding message recipient data:
- creating entries - adding another recipient to the message (requires being the manager or the moderator of the group)
- sending a copy of the message to the recipient's e-mail()
- marking a message as read (requires being the recipient)
- searching messages sent to the calling user
Staff users can do all of the above + list all message recipients or a specific one.
"""
from django.core.paginator import Paginator
from django.db.models import Q
from django.core.mail import send_mail
from django.core.mail import EmailMessage

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import MessageRecipient, Message, User
from api.serializers import MessageRecipientSerializer
from api.permissions.message_recipient_permissions import MessageRecipientPermission


class MessageRecipientViewSet(viewsets.ModelViewSet):
    queryset = MessageRecipient.objects.all().select_related("message")
    serializer_class = MessageRecipientSerializer
    permission_classes = [IsAuthenticated, MessageRecipientPermission]
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
    def send_email(self, request, pk=None):
        mr = self.get_object()
        send_mail(subject=mr.message.title, message=mr.message.content, from_email=mr.message.user.email, recipient_list=[mr.user.email])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        message_recipient = self.get_object()
        message_recipient.is_read = True
        message_recipient.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def me(self, request):
        search_query = request.GET.get("search", "")
        search_terms = search_query.split()

        query = Q()
        for term in search_terms:
            query |= Q(message__user__name__icontains=term) | \
                     Q(message__user__surname__icontains=term) | \
                     Q(message__title__icontains=term) | \
                     Q(message__group__name__icontains=term)

        received_messages = MessageRecipient.objects.select_related("message", "user", "message__group") \
            .filter(query, user=request.user) \
            .order_by("-message__date")

        paginator = Paginator(received_messages, 10)
        page = paginator.get_page(request.GET.get("page", 1))

        serializer = self.get_serializer(page, many=True)

        return Response({
            "items": serializer.data,
            "page_number": page.number,
            "total_pages": paginator.num_pages
        })
