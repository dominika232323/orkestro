"""
Handles API requests regarding group membership data:
- changing permissions, deletion (requires being the manager of the group, can't demote/remove the last manager)
- getting all members of a group (requires being a member of that group)
Adding members is normally done by invitations (or group creation - adds the creator).
Staff users can do all of the above + create members and list all/one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.models import Member
from api.serializers import MemberSerializer, UserSerializer
from rest_framework.response import Response

from api.permissions.member_permissions import CanViewCreateMember, CanEditDeleteMember


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated, CanViewCreateMember, CanEditDeleteMember]
    http_method_names = ["get", "post", "put", "delete", "head"]

    @staticmethod
    def is_last_manager(pk):
        member = Member.objects.get(member_id=pk)
        managers = Member.objects.filter(group=member.group, permission_level="A")
        return len(managers) == 1 and managers[0] == member

    def update(self, request, pk=None, *args, **kwargs):
        member = Member.objects.get(member_id=pk)
        data = MemberSerializer(instance=member, data=request.data)
        if not data.is_valid() or request.data.get("group") != member.group_id or request.data.get("member_id") != int(pk)\
                or request.data.get("user") != member.user_id:
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        if self.is_last_manager(pk) and request.data.get("permission_level") != "A":
            return Response({"error": "Can't demote the last manager"}, status=status.HTTP_400_BAD_REQUEST)
        data.save()
        return Response(status=status.HTTP_200_OK)

    def destroy(self, request, pk=None, *args, **kwargs):
        member = Member.objects.get(member_id=pk)
        if self.is_last_manager(pk):
            return Response({"error": "Can't remove the last manager"}, status=status.HTTP_400_BAD_REQUEST)
        member.delete()
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def by_group(self, request):
        members = Member.objects.filter(group=request.GET.get("group_id"))
        users = [m.user for m in members]
        serialized_members = MemberSerializer(members, many=True)
        serialized_users = UserSerializer(users, many=True)
        return Response({"members": serialized_members.data, "users": serialized_users.data})
