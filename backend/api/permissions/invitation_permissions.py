"""
Verifies permission to interact with invitation data (see invitation_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_manager


class InvitationPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["me", "accept", "reject"]:
            return True
        if view.action == "create":
            return is_manager(request, request.data.get("group"))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action in ["accept", "reject"]:
            return obj.user_id == request.user.user_id
        return False
