"""
Verifies permission to interact with file instrument data (see file_instrument_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager, get_group_by_file_id


class FileInstrumentPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action == "destroy":
            return True
        if view.action == "by_file":
            return is_member(request, get_group_by_file_id(request.GET.get("file_id")))
        if view.action == "create":
            return is_manager(request, get_group_by_file_id(request.data.get("file")))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action == "destroy":
            return is_manager(request, obj.track.group_id)
        return False
