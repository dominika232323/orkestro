"""
Handles API requests regarding user data:
- viewing and editing one's own data (some administrative columns are hidden from this viewset - see the serializer)
- viewing users in a group (requires being a member of that group)
- getting users that aren't added to an event/file (requires being a member of the related group)
- getting the ID of the user with given e-mail address (allows sending invitations without leaking everyone's full data)
Staff members can do all of the above + list all users or a specific one.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import User, Member, EventAttendee, FileAllowedMember
from api.serializers import UserSerializer
from api.permissions.user_permissions import UserPermission


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, UserPermission]
    http_method_names = ["get", "put", "head"]

    def update(self, request, pk=None, *args, **kwargs):
        serializer = self.get_serializer(instance=self.get_object(), data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Data validation failed"}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def leftover(self, request):
        if request.GET.get("event_id"):
            chosen = (EventAttendee.objects.select_related("event", "user")
                .filter(event_id=request.GET.get("event_id"), event__group_id=request.GET.get("group_id")))
        else:
            chosen = (FileAllowedMember.objects.select_related("file", "file__track", "user")
                .filter(file_id=request.GET.get("file_id"), file__track__group_id=request.GET.get("group_id")))
        chosen_users = [c.user for c in chosen]

        users = Member.objects.filter(group_id=request.GET.get("group_id")).select_related("user")
        users = [u.user for u in users if u.user not in chosen_users]

        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=["get"])
    def by_email(self, request):
        user = User.objects.filter(email=request.GET.get("email"))
        if len(user) == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({"user_id": user[0].user_id})

    @action(detail=False, methods=["get"])
    def by_group(self, request):
        members = Member.objects.filter(group=request.GET.get("group_id"))
        users = [m.user for m in members]
        serialized_users = UserSerializer(users, many=True)
        return Response(serialized_users.data)
