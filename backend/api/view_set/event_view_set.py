from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from api.models import Event
from api.serializers import EventSerializer

class EventViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action == 'by_group':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    queryset = Event.objects.all()
    serializer_class = EventSerializer

    @action(detail=False, methods=["get", "post", "put", "delete"])
    def by_group(self, request):
        user = request.user
        if request.method == "GET":
            group_id = request.GET.get("group_id")
        if request.method == "POST":
            group_id = request.data.get("group")
        if request.method in ["PUT", "DELETE"]:
            event_id = request.data.get("event_id")
            try:
                event = Event.objects.get(event_id=event_id)
            except Event.DoesNotExist as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            group_id = event.group
        group_membership = user.group_memberships.filter(group=group_id)
        is_manager = len(group_membership) != 0 and group_membership[0].permission_level == "A"
        if user.is_staff is False and len(group_membership) == 0:
            return Response(
                {"error": "Can't access data of a foreign group without admin (or the group doesn't exist)"},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == "GET":
            events = Event.objects.filter(group=group_id)
            serialized_events = EventSerializer(events, many=True)
            return Response({"events": serialized_events.data})

        if user.is_staff is False and is_manager is False:
            return Response(
                {"error": "Can't create, update or delete group data without manager or admin permissions"},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == "POST":
            data = EventSerializer(data=request.data)
            if not data.is_valid():
                return Response(
                    {"error": "Data validation failed"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            data.save()
            return Response(status=status.HTTP_200_OK)

        if request.method == "PUT":
            data = EventSerializer(instance=event, data=request.data)
            if not data.is_valid() or request.data.get("group_id") != group_id:
                return Response(
                    {"error": "Data validation failed"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            data.save()
            return Response(status=status.HTTP_200_OK)

        if request.method == "DELETE":
            data = EventSerializer(instance=event)
            data.delete()
            return Response(status=status.HTTP_200_OK)
