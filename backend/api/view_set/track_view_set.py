from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import Track
from api.serializers import TrackSerializer


class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated]
