"""
Handles API requests regarding group data:
- creation (if it's a subgroup - requires being the manager of the supergroup), also adds the creator as its member-manager
- edition, deletion (requires being the manager of the group)
- getting all groups that the calling user is a part of
- checking if the calling user is a manager/moderator of the group
Staff users can do all of the above + list all groups or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Group, Member
from api.permissions.common_checks import is_manager, is_moderator
from api.serializers import GroupSerializer, GroupCreateSerializer
from api.permissions.group_permissions import CanViewGroup, CanEditDeleteGroup, CanCreateSubgroup


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, CanViewGroup, CanEditDeleteGroup, CanCreateSubgroup]
    http_method_names = ["get", "post", "put", "delete", "head"]

    def create(self, request, *args, **kwargs):
        serializer = GroupCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        group = serializer.save()
        Member.objects.create(user=request.user, group=group, permission_level="A")
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def me(self, request):
        memberships = request.user.group_memberships.all().select_related("group")
        groups = [m.group for m in memberships]
        serializer = self.get_serializer(groups, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def role(self, request, pk=None):
        group = self.get_object()
        return Response({
            "is_manager": is_manager(request, group.group_id),
            "is_moderator": is_moderator(request, group.group_id),
        })
