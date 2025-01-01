"""
Verifies permission to interact with instrument data (see instrument_view_set.py)
"""
from rest_framework.permissions import BasePermission


class CanCreateEditDeleteInstrument(BasePermission):
    def has_permission(self, request, view):
        return request.method not in ["POST", "PUT", "DELETE"] or request.user.is_staff
