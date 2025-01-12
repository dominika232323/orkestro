"""
Verifies permission to interact with file data in the group (see file_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager, get_group_by_track_id


class FilePermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["me_by_event", "search", "download", "destroy"]:
            return True
        if view.action == "create":
            return is_manager(request, get_group_by_track_id(request.data.get("track")))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action == "destroy":
            return is_manager(request, obj.track.group_id)
        if view.action == "download":
            return is_member(request, get_group_by_track_id(obj.track_id))
        return False
