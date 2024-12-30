"""
Handles API requests regarding event data:
- creation, edition, deletion (requires being the manager of the group with the event)
- getting all events in a group (requires being a member of that group)
- getting all events regarding the calling user
Staff users can do all of the above + list all events or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Event, EventAttendee
from api.serializers import EventSerializer
from api.permissions.event_permissions import CanViewEvent, CanEditDeleteEvent, CanCreateEvent


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, CanViewEvent, CanCreateEvent, CanEditDeleteEvent]
    http_method_names = ["get", "post", "put", "delete", "head"]

    @action(detail=False, methods=["get"])
    def by_group(self, request):
        events = Event.objects.filter(group=request.GET.get("group_id"))
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def me(self, request):
        participations = EventAttendee.objects.filter(user=request.user).select_related("event")
        events = [p.event for p in participations]
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
