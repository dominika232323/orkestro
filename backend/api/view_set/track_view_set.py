"""
Handles API requests regarding track data:
- creation, edition, deletion (requires being a manager of the group with the track)
- getting all tracks in a group and adding search criteria: name, instrument, event (requires being a member of that group)
Staff users can do all of the above + list all tracks or a specific one.
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.models import Track, FileInstrument, EventTrack
from api.serializers import TrackSerializer
from api.permissions.track_permissions import CanViewTrack, CanCreateTrack, CanEditDeleteTrack
from rest_framework.response import Response


class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated, CanViewTrack, CanCreateTrack, CanEditDeleteTrack]
    http_method_names = ["get", "post", "put", "delete", "head"]

    @action(detail=False, methods=["get"])
    def search(self, request):
        event_tracks = (EventTrack.objects.select_related("event", "track").filter(track__group_id=request.GET.get("group_id"),
            event__name__icontains=request.GET.get("event") or "", track__name__icontains=request.GET.get("name") or ""))
        tracks = set([et.track for et in event_tracks])
        if request.GET.get("instrument") is not None:
            file_instruments = (FileInstrument.objects.select_related("file", "file__track", "instrument").defer('file__content')
                .filter(instrument__name__icontains=request.GET.get("instrument"), file__track__in=tracks))
            tracks = set([fi.file.track for fi in file_instruments])
        serializer = self.get_serializer(tracks, many=True)
        return Response(serializer.data)
