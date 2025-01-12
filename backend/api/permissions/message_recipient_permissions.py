"""
Verifies permission to interact with message recipient data (see message_recipient_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_author


class MessageRecipientPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["me", "mark_as_read", "send_email"]:
            return True
        if view.action == "create":
            return is_author(request, request.data.get("message"))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action == "mark_as_read":
            return obj.user_id == request.user.user_id
        if view.action == "send_email":
            return obj.message.user_id == request.user.user_id
        return False
