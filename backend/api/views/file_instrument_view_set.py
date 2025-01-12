"""
Handles API requests regarding file instrument data:
- creating and deleting entries (requires being a manager of the group)
- getting all instruments linked to a file (requires being a member of the group with the file)
Staff users can do all of the above + list all entries or a specific one.
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import FileInstrument
from api.serializers import FileInstrumentSerializer
from api.permissions.file_instrument_permissions import FileInstrumentPermission


class FileInstrumentViewSet(viewsets.ModelViewSet):
    queryset = FileInstrument.objects.all()
    serializer_class = FileInstrumentSerializer
    permission_classes = [IsAuthenticated, FileInstrumentPermission]
    http_method_names = ["get", "post", "delete", "head"]

    @action(detail=False, methods=["get"])
    def by_file(self, request):
        file_instruments = FileInstrument.objects.filter(file_id=request.GET.get("file_id")).select_related("instrument")
        serializer = self.get_serializer(file_instruments, many=True)
        return Response(serializer.data)
