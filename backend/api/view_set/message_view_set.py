from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import Message
from api.serializers import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
