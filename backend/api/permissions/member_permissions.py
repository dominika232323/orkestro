"""
Verifies permission to interact with membership data (see member_view_set.py).
"""
from rest_framework.permissions import BasePermission


class CanViewCreateMember(BasePermission):
    def has_permission(self, request, view):
        if request.method not in ["GET", "POST"] or request.user.is_staff:
            return True
        if request.method != "GET" or view.action != "by_group":
            return False
        group_id = request.GET.get("group_id")
        group_membership = request.user.group_memberships.filter(group=group_id)
        return len(group_membership) != 0


class CanEditDeleteMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method not in ["PUT", "DELETE"] or request.user.is_staff:
            return True
        group_membership = request.user.group_memberships.filter(group=obj.group)
        return len(group_membership) != 0 and group_membership[0].permission_level == "A"
