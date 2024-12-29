from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import User, Member
from api.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    #TODO: permissions, ...

    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=["get", "post"])
    def google_calendar_id(self, request):
        if request.method == "GET":
            return Response({"user_google_calendar_id": request.user.google_calendar_id})

        if request.method == "POST":
            try:
                new_google_calendar_id = request.data.get("google_calendar_id")

                if new_google_calendar_id is not None and len(new_google_calendar_id) > 1024:
                    raise ValueError("Google Calendar ID cannot be longer than 1024 characters")

                request.user.google_calendar_id = new_google_calendar_id
                request.user.save()
                return Response(status=status.HTTP_200_OK)

            except ValueError as e:
                return Response(
                    {"error": "Invalid Google Calendar ID", "details": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

    @action(detail=False, methods=["get"])
    def by_email(self, request): # for invitations, api should probably block getting full info about non-group-members
        user = User.objects.filter(email=request.GET.get("email"))
        if len(user) == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({"user_id": user[0].user_id})

    @action(detail=False, methods=["get"])
    def by_group(self, request):
        members = Member.objects.filter(group=request.GET.get("group_id"))
        users = [m.user for m in members]
        serialized_users = UserSerializer(users, many=True)
        return Response({"users": serialized_users.data})