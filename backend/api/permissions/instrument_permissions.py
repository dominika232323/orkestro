"""
Verifies permission to interact with instrument data (see instrument_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import have_common_group, is_member, get_group_by_file_id


class InstrumentPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action in ["search", "update", "destroy"]:
            return True
        if view.action == "leftover":
            if request.GET.get("file_id"):
                return is_member(request, get_group_by_file_id(request.GET.get("file_id")))
            if request.GET.get("user_id"):
                return have_common_group(request.user.user_id, request.GET.get("user_id"))
            return True
        return False

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or request.method == "HEAD"
