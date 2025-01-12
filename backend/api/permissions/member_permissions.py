"""
Verifies permission to interact with membership data (see member_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager

class MemberPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["me", "update", "destroy"]:
            return True
        if view.action in ["search", "by_group"]:
            return is_member(request, request.GET.get("group_id"))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action in ["update", "destroy"]:
            return is_manager(request, obj.group_id)
        return False
