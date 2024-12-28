from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Event
from api.serializers import EventSerializer
from api.permissions.event_permissions import CanViewEvent, CanEditDeleteEvent, CanCreateEvent


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, CanViewEvent, CanCreateEvent, CanEditDeleteEvent]
    http_method_names = ["get", "post", "put", "delete", "head"]

    def create(self, request, *args, **kwargs):
        data = EventSerializer(data=request.data)
        if not data.is_valid():
            return Response(
                {"error": "Data validation failed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        data.save()
        return Response(status=status.HTTP_200_OK)

    def update(self, request, pk=None, *args, **kwargs):
        event = Event.objects.get(event_id=pk)
        data = EventSerializer(instance=event, data=request.data)
        if not data.is_valid() or request.data.get("group") != event.group_id or request.data.get("event_id") != int(pk):
            return Response(
                {"error": "Data validation failed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        data.save()
        return Response(status=status.HTTP_200_OK)

    def destroy(self, request, pk=None, *args, **kwargs):
        event = Event.objects.get(event_id=pk)
        event.delete()
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def by_group(self, request):
        events = Event.objects.filter(group=request.GET.get("group_id"))
        serialized_events = EventSerializer(events, many=True)
        return Response({"events": serialized_events.data})
