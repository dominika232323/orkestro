"""
Verifies permission to interact with invitation data (see invitation_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.models import Invitation

from api.permissions.common_checks import is_manager


class CanViewInvitation(BasePermission):
    def has_permission(self, request, view):
        return request.method != "GET" or request.user.is_staff or view.action == "by_user" or view.action == "pending"


class CanCreateInvitation(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff or view.action == "respond":
            return True
        return is_manager(request, request.data.get("group"))


class CanRespondToInvitation(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff or view.action != "respond":
            return True
        try:
            invitation_id = int(request.data.get("invitation_id"))
            bool(request.data.get("accept"))
            inv = Invitation.objects.get(invitation_id=invitation_id)
            return request.user == inv.user
        except (Invitation.DoesNotExist, TypeError):
            return False
