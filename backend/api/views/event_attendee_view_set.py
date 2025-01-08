"""
Handles API requests regarding event attendee data:
- adding and removing entries (requires being a manager of the event's group)
- getting all attendees of an event (requires being a member of that group)
Staff users can do all of the above + list all event attendees or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import EventAttendee, Event, User
from api.serializers import EventAttendeeSerializer, EventSerializer, UserSerializer

from api.permissions.event_attendee_permissions import CanViewEventAttendee, CanCreateEventAttendee, CanDeleteEventAttendee


class EventAttendeeViewSet(viewsets.ModelViewSet):
    queryset = EventAttendee.objects.all().select_related("user")
    serializer_class = EventAttendeeSerializer
    permission_classes = [IsAuthenticated, CanViewEventAttendee, CanCreateEventAttendee, CanDeleteEventAttendee]
    http_method_names = ["get", "post", "delete", "head"]

    @staticmethod
    def is_member(data):
        event = Event.objects.get(event_id=data["event"])
        user = User.objects.get(user_id=data["user"])
        return user.group_memberships.filter(group_id=event.group_id).exists()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid() or not self.is_member(request.data):
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        # TODO: when Google Calendar is implemented - handle event creation in this method
        # TODO: handle event deletion in event_attendee, event, group destroy methods (need to overwrite defaults)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def mass_create(self, request, *args, **kwargs):
        response_data = []
        for attendee_data in request.data:
            serializer = self.get_serializer(data=attendee_data)
            if not serializer.is_valid() or not self.is_member(attendee_data):
                return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            response_data.append(serializer.data)
        return Response(data=response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def by_event(self, request):
        event_attendees = EventAttendee.objects.filter(event_id=request.GET.get("event_id")).select_related("user")
        serializer = self.get_serializer(event_attendees, many=True)
        return Response(serializer.data)
