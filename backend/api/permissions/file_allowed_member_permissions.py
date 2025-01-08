"""
Verifies permission to interact with file allowed member data (see file_allowed_member_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager, get_group_by_file_id


class CanViewFileAllowedMember(BasePermission):
    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff:
            return True
        if view.action != "by_file":
            return False
        return is_member(request, get_group_by_file_id(request.GET.get("file_id")))


class CanCreateFileAllowedMember(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return is_manager(request, get_group_by_file_id(request.data.get("file")))


class CanDeleteFileAllowedMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE" or request.user.is_staff:
            return True
        return is_manager(request, obj.file.track.group.group_id)