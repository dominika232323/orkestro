"""
Verifies permission to interact with track data in the group (see track_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager


class CanViewTrack(BasePermission):
    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff:
            return True
        if view.action != "search":
            return False
        return is_member(request, request.GET.get("group_id"))


class CanCreateTrack(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return is_manager(request, request.data.get("group"))


class CanEditDeleteTrack(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method not in ["PUT", "DELETE"] or request.user.is_staff:
            return True
        return is_manager(request, obj.group_id)
