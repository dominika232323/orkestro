"""
Handles API requests regarding message data:
- creating messages (requires being the manager or the moderator of the group)
- getting all messages of a group sent to the calling user
Staff users can do all of the above + list all messages or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Message, MessageRecipient
from api.serializers import MessageSerializer
from api.permissions.message_permissions import CanViewMessage, CanCreateMessage



class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().select_related("group", "user")
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, CanViewMessage, CanCreateMessage]
    http_method_names = ["get", "post", "head"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid() or str(request.user.user_id) != str(request.data.get("user")):
            return Response(data={"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def by_group(self, request):
        recipients = MessageRecipient.objects.filter(user_id=request.user.user_id).select_related("message", "message__group", "message__user")
        messages = [r.message for r in recipients if str(r.message.group_id) == request.GET.get("group_id")]
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
