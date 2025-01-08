"""
Handles API requests regarding event data:
- creation, edition, deletion (requires being the manager of the group with the event)
- searching events in a group (requires being a member of that group)
- getting all events regarding the calling user
Staff users can do all of the above + list all events or a specific one.
"""
from django.core.paginator import Paginator
from django.db.models import Q

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Event, EventAttendee, User
from api.serializers import EventSerializer, EventCreateSerializer
from api.permissions.event_permissions import CanViewEvent, CanEditDeleteEvent, CanCreateEvent


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, CanViewEvent, CanCreateEvent, CanEditDeleteEvent]
    http_method_names = ["get", "post", "put", "delete", "head"]

    def create(self, request, *args, **kwargs):
        serializer = EventCreateSerializer(data=request.data)
        try:
            if not serializer.is_valid():
                raise Exception("Data validation failed")
            event = serializer.save()

            attendees = request.GET.getlist("id")
            if len(attendees) == 0:
                raise Exception("Event must have at least one attendee")

            for user_id in map(int, attendees):
                attendee = EventAttendee.objects.create(
                    event=event,
                    user=User.objects.get(user_id=user_id),
                )
                attendee.save()

            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(data={"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def search(self, request):
        query = Q()
        for term in request.GET.get("search", "").split():
            query |= Q(name__icontains=term) | Q(place__icontains=term) | Q(description__icontains=term)

        events = Event.objects.filter(query, group_id=request.GET.get("group_id")).order_by("-date")

        paginator = Paginator(events, 5)
        page = paginator.get_page(request.GET.get("page", 1))
        serializer = self.get_serializer(page, many=True)

        return Response({
            "items": serializer.data,
            "page_number": page.number,
            "total_pages": paginator.num_pages
        })

    @action(detail=False, methods=["get"])
    def me(self, request):
        participations = EventAttendee.objects.filter(user=request.user).select_related("event")
        if request.GET.get("year") and request.GET.get("month"):
            participations = participations.filter(event__date__year=request.GET.get("year"), event__date__month=request.GET.get("month"))
        events = [p.event for p in participations]
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
