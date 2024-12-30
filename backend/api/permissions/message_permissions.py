"""
Verifies permission to interact with message data (see message_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_moderator


class CanViewMessage(BasePermission):
    def has_permission(self, request, view):
        return request.method != "GET" or request.user.is_staff or view.action == "by_group"


class CanCreateMessage(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return is_moderator(request, request.data.get("group"))