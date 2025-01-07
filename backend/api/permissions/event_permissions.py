"""
Verifies permission to interact with event data in the group (see event_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager


class CanViewEvent(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "GET" or request.user.is_staff or view.action == "me":
            return True
        if view.action in {"search", "by_group"}:
            return True
        return is_member(request, obj.group.group_id)


class CanCreateEvent(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return is_manager(request, request.data.get("group"))


class CanEditDeleteEvent(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method not in ["PUT", "DELETE"] or request.user.is_staff:
            return True
        return is_manager(request, obj.group_id)
