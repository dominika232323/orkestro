"""
Handles API requests regarding invitation data:
- creation (requires being the manager of the group of the invitation)
- responding to invitations (requires being the invitee, causes deletion of the invitation and if applies - turning it into a membership)
- getting all invitations sent to the calling user
Staff users can do all of the above + list all invitations or a specific one.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Invitation, User, Group, Member
from api.serializers import InvitationSerializer, GroupSerializer
from api.permissions.invitation_permissions import CanViewInvitation, CanCreateInvitation, CanRespondToInvitation


class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all().select_related("group")
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated, CanViewInvitation, CanCreateInvitation, CanRespondToInvitation]
    http_method_names = ["get", "post", "head"]

    @staticmethod
    def is_invitable(request):
        invitee = User.objects.get(user_id=request.data.get("user"))
        return (not invitee.group_memberships.filter(group_id=request.data.get("group")).exists()
                and not invitee.invitations.filter(group_id=request.data.get("group")).exists())

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid() or not self.is_invitable(request):
            return Response(data={"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        inv = self.get_object()
        Member.objects.create(group_id=inv.group_id, user_id=inv.user_id, permission_level=inv.permission_level)
        inv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        inv = self.get_object()
        inv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def me(self, request):
        invitations = Invitation.objects.filter(user=request.user).select_related("group")
        serializer = self.get_serializer(invitations, many=True)
        return Response(serializer.data)
