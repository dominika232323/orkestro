from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import User, EventAttendee


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_events(request):
    user = request.user
    events = EventAttendee.objects.filter(user=user).select_related("event")

    events_data = [
        {
            "event_id": user_event.event.event_id,
            "name": user_event.event.name,
            "description": user_event.event.description,
            "date": user_event.event.date,
            "place": user_event.event.place,
        }
        for user_event in events
    ]

    return Response({"events": events_data})
