"""
Verifies permission to interact with group data (see group_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.models import Group


class CanViewGroup(BasePermission):
    def has_permission(self, request, view):
        return request.method != "GET" or request.user.is_staff or view.action == "by_user"


class CanCreateSubgroup(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        if request.data.get("supergroup") is None:
            return True
        try:
            supergroup = Group.objects.get(group_id=request.data.get("supergroup"))
            managers = supergroup.members.filter(permission_level="A")
            if request.user.user_id in [m.user_id for m in managers]:
                return True
            return False
        except Group.DoesNotExist:
            return False


class CanEditDeleteGroup(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method not in ["PUT", "DELETE"] or request.user.is_staff:
            return True
        group_membership = request.user.group_memberships.filter(group=obj)
        return len(group_membership) != 0 and group_membership[0].permission_level == "A"
