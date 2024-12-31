"""
Handles API requests regarding user's instrument data:
- adding and removing instruments a user can play (requires being that user)
- viewing instruments of a user (requires being their groupmate).
Staff members can do all of the above + list all user instruments or a specific one.
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import UserInstrument, Instrument
from api.serializers import UserInstrumentSerializer, InstrumentSerializer
from api.permissions.user_instrument_permissions import CanViewUserInstrument, CanCreateUserInstrument, CanDeleteUserInstrument


class UserInstrumentViewSet(viewsets.ModelViewSet):
    queryset = UserInstrument.objects.all()
    serializer_class = UserInstrumentSerializer
    permission_classes = [IsAuthenticated, CanViewUserInstrument, CanCreateUserInstrument, CanDeleteUserInstrument]
    http_method_names = ["get", "post", "delete", "head"]

    @action(detail=False, methods=["get"])
    def by_user(self, request):
        user_instruments = UserInstrument.objects.filter(user_id=request.GET.get("user_id", default=0))
        serializer = self.get_serializer(user_instruments, many=True)
        return Response(serializer.data)
