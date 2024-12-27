from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Invitation
from api.serializers import InvitationSerializer


class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.select_related("group").all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def pending(self, request):
        pending_invitations = Invitation.objects.filter(
            user=request.user,
        ).select_related("group")

        serializer = self.get_serializer(pending_invitations, many=True)
        return Response(serializer.data)
