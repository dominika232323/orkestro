"""
Verifies permission to interact with event attendee data (see event_attendee_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager, get_group_by_event_id


class EventAttendeePermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action == "destroy":
            return True
        if view.action == "by_event":
            return is_member(request, get_group_by_event_id(request.GET.get("event_id")))
        if view.action == "create":
            return is_manager(request, get_group_by_event_id(request.data.get("event")))
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action == "destroy":
            return is_manager(request, obj.event.group_id)
        return False
