from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import FileInstrument
from api.serializers import FileInstrumentSerializer


class FileInstrumentViewSet(viewsets.ModelViewSet):
    queryset = FileInstrument.objects.all()
    serializer_class = FileInstrumentSerializer
    permission_classes = [IsAuthenticated]
