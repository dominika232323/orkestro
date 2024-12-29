"""
Verifies permission to interact with event data in the group (see event_view_set.py).
"""
from rest_framework.permissions import BasePermission

from api.models import Event


class CanViewEvent(BasePermission):
    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff or view.action == "by_user":
            return True
        if view.action != "by_group":
            return False
        group_id = request.GET.get("group_id")
        group_membership = request.user.group_memberships.filter(group=group_id)
        return len(group_membership) != 0


class CanCreateEvent(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        group_id = request.data.get("group")
        group_membership = request.user.group_memberships.filter(group=group_id)
        return len(group_membership) != 0 and group_membership[0].permission_level == "A"


class CanEditDeleteEvent(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method not in ["PUT", "DELETE"] or request.user.is_staff:
            return True
        try:
            event = Event.objects.get(event_id=obj.event_id)
            group_membership = request.user.group_memberships.filter(group=event.group_id)
            return len(group_membership) != 0 and group_membership[0].permission_level == "A"
        except Event.DoesNotExist:
            return False
