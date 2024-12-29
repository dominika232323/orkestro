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
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated, CanViewInvitation, CanCreateInvitation, CanRespondToInvitation]
    http_method_names = ["get", "post", "head"]

    @staticmethod
    def is_invitable(request):
        try:
            invitee = User.objects.get(user_id=request.data.get("user"))
            group = Group.objects.get(group_id=request.data.get("group"))
            group_membership = invitee.group_memberships.filter(group=group)
            group_invitation = invitee.invitations.filter(group=group)
            return len(group_membership) == 0 and len(group_invitation) == 0
        except (User.DoesNotExist, Group.DoesNotExist):
            return False

    def create(self, request, *args, **kwargs):
        data = InvitationSerializer(data=request.data)
        if not data.is_valid() or not self.is_invitable(request):
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        data.save()
        return Response(status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def respond(self, request):
        invitation_id = int(request.data.get("invitation_id"))
        accept = bool(request.data.get("accept"))
        inv = Invitation.objects.get(invitation_id=invitation_id)
        if accept:
            Member.objects.create(group=inv.group, user=inv.user, permission_level=inv.permission_level)
        inv.delete()
        return Response(status=status.HTTP_201_CREATED if accept else status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def by_user(self, request):
        invitations = Invitation.objects.filter(user=request.user)
        groups = [i.group for i in invitations]
        serialized_invitations = InvitationSerializer(invitations, many=True)
        serialized_groups = GroupSerializer(groups, many=True)
        return Response({"invitations": serialized_invitations.data, "groups": serialized_groups.data})
