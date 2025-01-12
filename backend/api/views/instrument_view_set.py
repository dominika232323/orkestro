"""
Handles API requests regarding instrument data:
- viewing all or one instrument, searching by name and language
- getting instruments that aren't added to a user/file (requires being a member of the related group)
- creating, editing, deleting entries (managed by staff users)
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Instrument, UserInstrument, FileInstrument
from api.serializers import InstrumentSerializer
from api.permissions.instrument_permissions import InstrumentPermission


class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer
    permission_classes = [IsAuthenticated, InstrumentPermission]
    http_method_names = ["get", "post", "put", "delete", "head"]

    @action(detail=False, methods=["get"])
    def leftover(self, request):
        if request.GET.get("file_id"):
            chosen = (FileInstrument.objects.filter(file_id=request.GET.get("file_id"))).select_related("instrument")
        elif request.GET.get("user_id"):
            chosen = (UserInstrument.objects.filter(user_id=request.GET.get("user_id"))).select_related("instrument")
        else:
            chosen = (UserInstrument.objects.filter(user_id=request.user.user_id)).select_related("instrument")
        chosen_instruments = [c.instrument for c in chosen]

        instruments = [i for i in Instrument.objects.all() if i not in chosen_instruments]

        serializer = self.get_serializer(instruments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def search(self, request):
        instruments = Instrument.objects.filter(**{f"name_{request.GET.get('language')}__icontains": request.GET.get("name", "")})
        serializer = self.get_serializer(instruments, many=True)
        return Response(serializer.data)
