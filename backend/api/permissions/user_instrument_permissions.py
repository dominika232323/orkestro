"""
Verifies permission to interact with user instrument data (see user_instrument_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import have_common_group


class CanViewUserInstrument(BasePermission):
    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff:
            return True
        if view.action != "by_user":
            return False
        return str(request.user.user_id) == request.GET.get("user_id") or have_common_group(request.user.user_id, request.GET.get("user_id"))


class CanCreateUserInstrument(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST" or request.user.is_staff:
            return True
        return request.data.get("user_id") == request.user.user_id


class CanDeleteUserInstrument(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE" or request.user.is_staff:
            return True
        return obj.user_id == request.user.user_id
