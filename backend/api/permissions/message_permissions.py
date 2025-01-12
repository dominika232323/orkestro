"""
Verifies permission to interact with message data (see message_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_moderator


class MessagePermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action == "by_group":
            return True
        if view.action == "create":
            return is_moderator(request, request.data.get("group"))
        return False
