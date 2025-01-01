"""
Verifies permission to interact with user instrument data (see user_instrument_view_set.py)
"""
from rest_framework.permissions import BasePermission

from api.models import Member


class CanViewUserInstrument(BasePermission):
    @staticmethod
    def have_common_group(caller_id, user_id):
        caller_memberships = Member.objects.filter(user_id=caller_id)
        user_memberships = Member.objects.filter(user_id=user_id)
        for cm in caller_memberships:
            for um in user_memberships:
                if cm.group_id == um.group_id:
                    return True
        return False

    def has_permission(self, request, view):
        if request.method != "GET" or request.user.is_staff:
            return True
        if view.action != "by_user":
            return False
        return self.have_common_group(request.user.user_id, request.GET.get("user_id"))


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
