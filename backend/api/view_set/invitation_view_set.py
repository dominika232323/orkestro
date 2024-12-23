from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import Invitation
from api.serializers import InvitationSerializer


class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]
