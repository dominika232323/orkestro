from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import MessageRecipient
from api.serializers import MessageRecipientSerializer


class MessageRecipientViewSet(viewsets.ModelViewSet):
    queryset = MessageRecipient.objects.select_related("message").select_related("user").all()
    serializer_class = MessageRecipientSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def received(self, request):
        received_messages = MessageRecipient.objects.filter(
            user=request.user,
        ).select_related("message").select_related("user")

        serializer = self.get_serializer(received_messages, many=True)
        return Response(serializer.data)
