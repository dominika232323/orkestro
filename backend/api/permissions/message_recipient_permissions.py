"""
Verifies permission to interact with message recipient data (see message_recpient_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_moderator, get_group_by_message_id


class CanViewMessageRecipient(BasePermission):
    def has_permission(self, request, view):
        return request.method != "GET" or request.user.is_staff or view.action == "me"


class CanCreateMessageRecipient(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return is_moderator(request, get_group_by_message_id(request.data.get("message")))


class CanMarkAsRead(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "POST" or request.user.is_staff:
            return True
        return obj.user_id == request.user.user_id