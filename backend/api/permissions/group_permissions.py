"""
Verifies permission to interact with group data (see group_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.models import Group
from api.permissions.common_checks import is_manager


class CanViewGroup(BasePermission):
    def has_permission(self, request, view):
        return request.method != "GET" or request.user.is_staff or view.action == "me"


class CanCreateSubgroup(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff or request.data.get("supergroup") is None:
            return True
        try:
            supergroup = Group.objects.get(group_id=request.data.get("supergroup"))
        except Group.DoesNotExist:
            return False
        return is_manager(request, supergroup.group_id)


class CanEditDeleteGroup(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method not in ["PUT", "DELETE"] or request.user.is_staff:
            return True
        return is_manager(request, obj.group_id)
