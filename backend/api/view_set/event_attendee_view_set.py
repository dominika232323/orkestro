from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import EventAttendee
from api.serializers import EventAttendeeSerializer, EventSerializer


class EventAttendeeViewSet(viewsets.ModelViewSet):
    queryset = EventAttendee.objects.all()
    serializer_class = EventAttendeeSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get", "post", "delete"])
    def events(self, request):
        if request.method == "GET":
            user = request.user
            user_events = user.attended_events.all()

            events = [ui.event for ui in user_events]
            serialized_events = EventSerializer(events, many=True)

            return Response({"events": serialized_events.data})

        if request.method == "POST":
            pass

        if request.method == "DELETE":
            pass
