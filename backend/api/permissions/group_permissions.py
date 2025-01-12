"""
Verifies permission to interact with group data (see group_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.models import Group
from api.permissions.common_checks import is_manager


class GroupPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["me", "role", "update", "delete"]:
            return True
        if view.action == "create":
            if request.data.get("supergroup") is None:
                return True
            try:
                supergroup = Group.objects.get(group_id=request.data.get("supergroup"))
            except Group.DoesNotExist:
                return False
            return is_manager(request, supergroup.group_id)
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD" or view.action == "role":
            return True
        if view.action in ["update", "delete"]:
            return is_manager(request, obj.group_id)
        return False
