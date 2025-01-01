"""
Verifies permission to interact with user data (see user_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member


class CanViewUser(BasePermission):
    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff or view.action in ["me", "by_email"]:
            return True
        if view.action != "by_group":
            return False
        return is_member(request, request.GET.get("group_id"))

class CanEditUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method != "PUT" or request.user.is_staff or obj.user_id == request.user.user_id
