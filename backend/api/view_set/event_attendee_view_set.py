from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import EventAttendee
from api.serializers import EventAttendeeSerializer


class EventAttendeeViewSet(viewsets.ModelViewSet):
    queryset = EventAttendee.objects.all()
    serializer_class = EventAttendeeSerializer
    permission_classes = [IsAuthenticated]
