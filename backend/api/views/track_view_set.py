"""
Handles API requests regarding track data:
- creation, edition, deletion (requires being a manager of the group with the track)
- getting tracks that are not added to an event (requires being a member of the related group)
- getting all tracks in a group and adding search criteria: name, instrument, event (requires being a member of that group)
Staff users can do all of the above + list all tracks or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Track, FileInstrument, EventTrack
from api.serializers import TrackSerializer, TrackCreateSerializer
from api.permissions.track_permissions import TrackPermission

from django.core.paginator import Paginator
from django.db.models import Q


class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated, TrackPermission]
    http_method_names = ["get", "post", "put", "delete", "head"]

    def create(self, request, *args, **kwargs):
        serializer = TrackCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def leftover(self, request):
        chosen = (EventTrack.objects.select_related("track")
            .filter(event_id=request.GET.get("event_id"), track__group_id=request.GET.get("group_id")))
        chosen_tracks = [c.track for c in chosen]

        tracks = Track.objects.filter(group_id=request.GET.get("group_id"))
        tracks = [t for t in tracks if t not in chosen_tracks]

        serializer = self.get_serializer(tracks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def search(self, request):
        group_id = request.GET.get("group_id")
        terms = request.GET.get("search", "").split()
        search_language = request.GET.get("lang", "en")

        query = Q()
        for term in terms:
            query |= Q(name__icontains=term)
        tracks = Track.objects.filter(query, group_id=group_id)
        tracks = set([t for t in tracks])

        query = Q()
        for term in terms:
            query |= Q(event__name__icontains=term)
        event_tracks = EventTrack.objects.filter(query, track__group_id=group_id).select_related("event", "track")
        tracks = tracks.union(set([et.track for et in event_tracks]))

        query = Q()
        for term in terms:
            query |= Q(**{f"instrument__name_{search_language}__icontains": term})
        file_instruments = FileInstrument.objects.filter(query, file__track__group_id=group_id).select_related("file__track").defer('file__content')
        tracks = tracks.union(set([fi.file.track for fi in file_instruments]))

        tracks = sorted(tracks, key=lambda track: track.name)

        paginator = Paginator(tracks, 10)
        page = paginator.get_page(request.GET.get("page", 1))
        serializer = self.get_serializer(page, many=True)

        return Response({
            "items": serializer.data,
            "page_number": page.number,
            "total_pages": paginator.num_pages
        })
