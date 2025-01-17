"""
Verifies permission to interact with track data in the group (see track_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager


class TrackPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["update", "destroy", "retrieve"]:
            return True
        if view.action in ["search", "leftover"]:
            return is_member(request, request.GET.get("group_id"))
        if view.action == "create":
            return is_manager(request, request.data.get("group"))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action in ["update", "destroy"]:
            return is_manager(request, obj.group_id)
        if view.action == "retrieve":
            return is_member(request, obj.group_id)
        return False
