"""
Verifies permission to interact with event data in the group (see event_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager

class EventPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["me", "retrieve", "update", "destroy"]:
            return True
        if view.action == "search":
            return is_member(request, request.GET.get("group_id"))
        if view.action == "create":
            return is_manager(request, request.data.get("group"))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action == "retrieve":
            return is_member(request, obj.group.group_id)
        if view.action in ["update", "destroy"]:
            return is_manager(request, obj.group_id)
        return False
