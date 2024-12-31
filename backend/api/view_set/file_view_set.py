"""
Handles API requests regarding file data:
- creation, deletion (requires being a manager of the group with the file)
- getting all files shared with the calling user for a track and adding search criteria: name, instrument
- getting all files shared with the calling user for an event
Staff users can do all of the above + list all files or a specific one.
"""
import io

from django.http import FileResponse

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import File
from api.serializers import FileSerializer
from api.models import FileAllowedMember, Event, EventTrack, FileInstrument

from api.permissions.file_permissions import CanViewFile, CanDownloadFile, CanCreateFile, CanDeleteFile


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer # file content hidden from most responses
    permission_classes = [IsAuthenticated, CanViewFile, CanDownloadFile, CanCreateFile, CanDeleteFile]
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
        files_for_me = (FileAllowedMember.objects.select_related("file", "file__track").defer('file__content')
            .filter(user_id=request.user, file__track__track_id=request.GET.get("track_id"),
                    file__name__icontains=request.GET.get("name") or ""))
        files = [ffm.file for ffm in files_for_me]
        print(files)
        if len(request.GET.getlist("instrument_id")) != 0:
            file_instruments = (FileInstrument.objects.select_related("file").defer('file__content')
                .filter(file__in=files, instrument_id__in=request.GET.getlist("instrument_id")))
            files = set([fi.file for fi in file_instruments])
        serializer = self.get_serializer(files, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def me_by_event(self, request):
        files_for_me = FileAllowedMember.objects.filter(user=request.user).select_related("file", "file__track").defer('file__content')
        event_tracks = EventTrack.objects.filter(event_id=request.GET.get("event_id")).select_related("track")
        track_ids = [et.track_id for et in event_tracks]
        files = [ffm.file for ffm in files_for_me if ffm.file.track_id in track_ids]
        serializer = self.get_serializer(files, many=True)
        return Response(serializer.data)
