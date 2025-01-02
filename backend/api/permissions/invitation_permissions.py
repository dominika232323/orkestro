"""
Verifies permission to interact with invitation data (see invitation_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.models import Invitation

from api.permissions.common_checks import is_manager


class CanViewInvitation(BasePermission):
    def has_permission(self, request, view):
        return request.method != "GET" or request.user.is_staff or view.action == "me"


class CanCreateInvitation(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff or view.action in {"accept", "reject"}:
            return True
        return is_manager(request, request.data.get("group"))


class CanRespondToInvitation(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "POST" or request.user.is_staff or view.action not in ["accept", "reject"]:
            return True
        return obj.user_id == request.user.user_id
