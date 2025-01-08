"""
Verifies permission to interact with message recipient data (see message_recipient_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_author


class CanViewMessageRecipient(BasePermission):
    def has_permission(self, request, view):
        return request.method != "GET" or request.user.is_staff or view.action == "me"


class CanCreateMessageRecipient(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff or view.action in ["mark_as_read", "send_email"]:
            return True

        recipients = [request.data] if type(request.data) == dict else request.data
        for recipient in recipients:
            if not is_author(request, recipient["message"]):
                return False
        return True


class CanMarkAsRead(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "POST" or request.user.is_staff or view.action != "mark_as_read":
            return True
        return obj.user_id == request.user.user_id


class CanSendEmail(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "POST" or request.user.is_staff or view.action != "send_email":
            return True
        return obj.message.user_id == request.user.user_id