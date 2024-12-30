"""
Verifies permission to interact with file data in the group (see file_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager, get_group_by_track_id


class CanViewFile(BasePermission):
    def has_permission(self, request, view):
        return request.method != "GET" or request.user.is_staff or view.action in ["search", "me_by_event", "download"]


class CanDownloadFile(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "GET" or request.user.is_staff:
            return True
        if view.action != "download":
            return False
        return is_member(request, get_group_by_track_id(obj.track_id))


class CanCreateFile(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return is_manager(request, get_group_by_track_id(request.data.get("track")))


class CanDeleteFile(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE" or request.user.is_staff:
            return True
        return is_manager(request, obj.track.group_id)
