"""
Verifies permission to interact with instrument data (see instrument_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import have_common_group, is_member, get_group_by_file_id


class CanViewLeftover(BasePermission):
    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff or view.action != "leftover":
            return True
        if request.GET.get("file_id"):
            return is_member(request, get_group_by_file_id(request.GET.get("file_id")))
        if request.GET.get("user_id"):
            return have_common_group(request.user.user_id, request.GET.get("user_id"))
        return True


class CanCreateEditDeleteInstrument(BasePermission):
    def has_permission(self, request, view):
        return request.method not in ["POST", "PUT", "DELETE"] or request.user.is_staff
