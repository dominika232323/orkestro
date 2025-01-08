"""
Handles API requests regarding events' track data:
- adding and removing entries (requires being a manager of the group)
- getting all entries related to a track (requires being a member of the group)
Staff users can do all of the above + list all event tracks or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Event, Track, EventTrack
from api.serializers import EventTrackSerializer
from api.permissions.event_track_permissions import CanViewEventTrack, CanCreateEventTrack, CanDeleteEventTrack


class EventTrackViewSet(viewsets.ModelViewSet):
    queryset = EventTrack.objects.all()
    serializer_class = EventTrackSerializer
    permission_classes = [IsAuthenticated, CanViewEventTrack, CanCreateEventTrack, CanDeleteEventTrack]
    http_method_names = ["get", "post", "delete", "head"]

    @staticmethod
    def are_related(request):
        event = Event.objects.get(event_id=request.data.get("event"))
        track = Track.objects.get(track_id=request.data.get("track"))
        return event.group_id == track.group_id

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid() or not self.are_related(request):
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def by_track(self, request):
        event_tracks = EventTrack.objects.filter(track_id=request.GET.get("track_id")).select_related("track", "event")
        serializer = self.get_serializer(event_tracks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_event(self, request):
        event_tracks = EventTrack.objects.filter(event_id=request.GET.get("group_id")).select_related("track", "event")
        serializer = self.get_serializer(event_tracks, many=True)
        return Response(serializer.data)
