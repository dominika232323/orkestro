"""
Verifies permission to interact with event track data (see event_track_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager, get_group_by_track_id


class CanViewEventTrack(BasePermission):
    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff:
            return True
        if view.action != "by_track":
            return False
        return is_member(request, get_group_by_track_id(request.GET.get("track")))


class CanCreateEventTrack(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return is_manager(request, get_group_by_track_id(request.data.get("track")))


class CanDeleteEventTrack(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE" or request.user.is_staff:
            return True
        return is_manager(request, obj.track.group_id)
