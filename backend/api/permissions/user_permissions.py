"""
Verifies permission to interact with user data (see user_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member


class UserPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["me", "by_email", "update"]:
            return True
        if view.action in ["by_group", "leftover"]:
            return is_member(request, request.GET.get("group_id"))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action == "update":
            return obj.user_id == request.user.user_id
        return False
