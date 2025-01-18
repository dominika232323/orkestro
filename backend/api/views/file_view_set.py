"""
Handles API requests regarding file data:
- creation, deletion (requires being a manager of the group with the file)
- searching files shared with the calling user for a track
- getting all files shared with the calling user for an event
Staff users can do all of the above + list all files or a specific one.
"""
import io

from django.core.paginator import Paginator
from django.http import FileResponse

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import File
from api.serializers import FileSerializer
from api.models import FileAllowedMember, Event, EventTrack, FileInstrument

from api.permissions.file_permissions import FilePermission


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated, FilePermission]
    http_method_names = ["get", "post", "delete", "head"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        file = serializer.save()
        file.content = request.FILES.get("file").read()
        file.save()
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None, *args, **kwargs):
        file = self.get_object()
        return FileResponse(io.BytesIO(file.content), filename=file.name, as_attachment=True)

    @action(detail=False, methods=["get"])
    def search(self, request):
        track_id = request.GET.get("track_id")
        search_query = request.GET.get("search", "")
        page_number = request.GET.get("page", 1)
        search_language = request.GET.get("search_language", "en")

        files_for_me = (
            FileAllowedMember.objects.select_related("file", "file__track")
            .defer("file__content")
            .filter(
                user_id=request.user,
                file__track__track_id=track_id,
            )
        )

        if search_query:
            file_ids_matching_name = files_for_me.filter(
                file__name__icontains=search_query
            ).values_list("file_id", flat=True)

            instrument_field = ("instrument__name_en__icontains" if search_language == "en" else "instrument__name_pl__icontains")

            file_ids_matching_instrument = (
                FileInstrument.objects.filter(
                    file__in=[ffm.file for ffm in files_for_me],
                )
                .filter(**{instrument_field: search_query})  # Dynamic field
                .values_list("file_id", flat=True)
            )

            matching_file_ids = set(file_ids_matching_name).union(file_ids_matching_instrument)

            files_for_me = files_for_me.filter(file_id__in=matching_file_ids)

        files = sorted([ffm.file for ffm in files_for_me], key=lambda file: file.name)

        paginator = Paginator(files, 10)
        page = paginator.get_page(page_number)
        serializer = self.get_serializer(page, many=True)

        return Response({
            "items": serializer.data,
            "page_number": page.number,
            "total_pages": paginator.num_pages,
        })

    @action(detail=False, methods=["get"])
    def me_by_event(self, request):
        files_for_me = (FileAllowedMember.objects.select_related("file", "file__track").defer('file__content')
                        .order_by("file__name").filter(user=request.user))
        event_tracks = EventTrack.objects.filter(event_id=request.GET.get("event_id")).select_related("track")
        track_ids = [et.track_id for et in event_tracks]
        files = [ffm.file for ffm in files_for_me if ffm.file.track_id in track_ids]

        paginator = Paginator(files, 10)
        page = paginator.get_page(request.GET.get("page", 1))
        serializer = self.get_serializer(page, many=True)

        return Response({
            "items": serializer.data,
            "page_number": page.number,
            "total_pages": paginator.num_pages
        })
