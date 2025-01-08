"""
Handles API requests regarding group membership data:
- changing permissions, deletion (requires being the manager of the group, can't demote/remove the last manager)
- searching members in a group (requires being a member of that group)
Adding members is normally done by invitations (or group creation - adds the creator).
Staff users can do all of the above + create members and list all/one.
"""
from django.core.paginator import Paginator
from django.db.models import Q

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Member
from api.serializers import MemberSerializer, MemberCreateSerializer
from api.permissions.member_permissions import CanViewCreateMember, CanEditDeleteMember


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().select_related("user")
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated, CanViewCreateMember, CanEditDeleteMember]
    http_method_names = ["get", "post", "put", "delete", "head"]

    def create(self, request, *args, **kwargs):
        serializer = MemberCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @staticmethod
    def is_last_manager(member):
        managers = Member.objects.filter(group_id=member.group_id, permission_level="A")
        return len(managers) == 1 and managers[0] == member

    def update(self, request, pk=None, *args, **kwargs):
        member = self.get_object()
        serializer = self.get_serializer(instance=member, data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        if self.is_last_manager(member) and request.data.get("permission_level") != "A":
            return Response({"error": "Can't demote the last manager"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None, *args, **kwargs):
        member = self.get_object()
        if self.is_last_manager(member):
            return Response({"error": "Can't remove the last manager"}, status=status.HTTP_400_BAD_REQUEST)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def search(self, request):
        name_query = Q()
        for term in request.GET.get("name", "").split():
            name_query |= Q(user__name__icontains=term) | Q(user__surname__icontains=term)
        permission_level_query = Q(permission_level__icontains=request.GET.get("permission_level", ""))

        members = (Member.objects.select_related("user").order_by("user__name")
            .filter(name_query, permission_level_query, group_id=request.GET.get("group_id")))

        paginator = Paginator(members, 10)
        page = paginator.get_page(request.GET.get("page", 1))
        serializer = self.get_serializer(page, many=True)

        return Response({
            "items": serializer.data,
            "page_number": page.number,
            "total_pages": paginator.num_pages
        })

    @action(detail=False, methods=["get"])
    def by_group(self, request):
        members = (Member.objects.select_related("user").order_by("user__name")
            .filter(group_id=request.GET.get("group_id")))
        serializer = self.get_serializer(members, many=True)
        return Response(serializer.data)
