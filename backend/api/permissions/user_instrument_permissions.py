"""
Verifies permission to interact with user instrument data (see user_instrument_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.permissions.common_checks import have_common_group


class UserInstrumentPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff or request.method == "HEAD" or view.action == "destroy":
            return True
        if view.action == "by_user":
            return (str(request.user.user_id) == request.GET.get("user_id")
                    or have_common_group(request.user.user_id, request.GET.get("user_id")))
        if view.action == "create":
            return request.data.get("user") == request.user.user_id
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.method == "HEAD":
            return True
        if view.action == "destroy":
            return obj.user_id == request.user.user_id
        return False
