"""
Handles API requests regarding file's allowed members data:
- creating and deleting entries (requires being a manager of the group)
- getting all users allowed to view a file (requires being a member of the group with the file)
Staff users can do all of the above + list all entries or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import FileAllowedMember, Member
from api.serializers import FileAllowedMemberSerializer
from api.permissions.file_allowed_member_permissions import CanViewFileAllowedMember, CanCreateFileAllowedMember, CanDeleteFileAllowedMember


class FileAllowedMemberViewSet(viewsets.ModelViewSet):
    queryset = FileAllowedMember.objects.all()
    serializer_class = FileAllowedMemberSerializer
    permission_classes = [IsAuthenticated, CanViewFileAllowedMember, CanCreateFileAllowedMember, CanDeleteFileAllowedMember]
    http_method_names = ["get", "post", "delete", "head"]

    @staticmethod
    def is_last_manager_with_access(file_allowed_member):
        managers = Member.objects.filter(group_id=file_allowed_member.file.track.group_id, permission_level="A")
        file_allowed_members = FileAllowedMember.objects.filter(file_id=file_allowed_member.file_id)
        managers = [m for m in managers if m.user_id in [f.user_id for f in file_allowed_members]]
        return len(managers) == 1 and managers[0].user_id == file_allowed_member.user_id

    @action(detail=False, methods=["post"])
    def mass_create(self, request, *args, **kwargs):
        response_data = []
        for member_data in request.data:
            serializer = self.get_serializer(data=member_data)
            if not serializer.is_valid():
                return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            response_data.append(serializer.data)
        return Response(data=response_data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None, *args, **kwargs):
        file_allowed_member = self.get_object()
        if self.is_last_manager_with_access(file_allowed_member):
            return Response({"error": "Can't remove the last manager's access to the file"}, status=status.HTTP_400_BAD_REQUEST)
        file_allowed_member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def by_file(self, request):
        file_allowed_members = FileAllowedMember.objects.filter(file_id=request.GET.get("file_id")).select_related("user")
        serializer = self.get_serializer(file_allowed_members, many=True)
        return Response(serializer.data)
