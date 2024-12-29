"""
Handles API requests regarding group data:
- creation (if it's a subgroup - requires being the manager of the supergroup), also adds the creator as its member-manager
- edition, deletion (requires being the manager of the group)
- getting all groups that the calling user is a part of
Staff users can do all of the above + list all groups or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Group, Member
from api.serializers import GroupSerializer
from api.permissions.group_permissions import CanViewGroup, CanEditDeleteGroup, CanCreateSubgroup


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, CanViewGroup, CanEditDeleteGroup, CanCreateSubgroup]
    http_method_names = ["get", "post", "put", "delete", "head"]

    @staticmethod
    def has_same_supergroup(request, group):
        if request.data.get("supergroup") is None and group.supergroup_id is None:
            return True
        if request.data.get("supergroup") is None or group.supergroup_id is None:
            return False
        return int(request.data.get("supergroup")) == group.supergroup.group_id

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        group = serializer.save()
        Member.objects.create(user=request.user, group=group, permission_level="A")
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None, *args, **kwargs):
        group = Group.objects.get(group_id=pk)
        serializer = self.get_serializer(instance=group, data=request.data)
        if not serializer.is_valid() or request.data.get("group_id") != int(pk) or not self.has_same_supergroup(request, group):
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def me(self, request):
        memberships = request.user.group_memberships.all().select_related("group")
        groups = [m.group for m in memberships]
        serializer = self.get_serializer(groups, many=True)
        return Response(serializer.data)
