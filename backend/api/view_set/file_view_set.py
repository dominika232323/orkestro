from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import File
from api.serializers import FileSerializer


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
