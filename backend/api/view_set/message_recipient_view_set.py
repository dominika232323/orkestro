from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import MessageRecipient
from api.serializers import MessageRecipientSerializer


class MessageRecipientViewSet(viewsets.ModelViewSet):
    queryset = MessageRecipient.objects.all()
    serializer_class = MessageRecipientSerializer
    permission_classes = [IsAuthenticated]
