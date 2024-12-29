"""
Verifies permission to interact with membership data (see member_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager


class CanViewCreateMember(BasePermission):
    def has_permission(self, request, view):
        if request.method not in ["GET", "POST"] or request.user.is_staff:
            return True
        if request.method != "GET" or view.action != "by_group":
            return False
        return is_member(request, request.GET.get("group_id"))


class CanEditDeleteMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method not in ["PUT", "DELETE"] or request.user.is_staff:
            return True
        return is_manager(request, obj.group_id)
