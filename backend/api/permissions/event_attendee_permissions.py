"""
Verifies permission to interact with event attendee data (see event_attendee_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import is_member, is_manager, get_group_by_event_id


class CanViewEventAttendee(BasePermission):
    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff:
            return True
        if view.action != "by_event":
            return False
        return is_member(request, get_group_by_event_id(request.GET.get("event_id")))


class CanCreateEventAttendee(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return is_manager(request, get_group_by_event_id(request.data.get("event")))


class CanDeleteEventAttendee(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE" or request.user.is_staff:
            return True
        return is_manager(request, obj.event.group_id)
