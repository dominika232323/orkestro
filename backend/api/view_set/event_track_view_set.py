from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import EventTrack
from api.serializers import EventTrackSerializer


class EventTrackViewSet(viewsets.ModelViewSet):
    queryset = EventTrack.objects.all()
    serializer_class = EventTrackSerializer
    permission_classes = [IsAuthenticated]
