from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import User
from api.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="name")
    def get_name(self, request):
        return Response({"user_surname": request.user.name})

    @action(detail=False, methods=["get"])
    def surname(self, request):
        return Response({"user_surname": request.user.surname})

    @action(detail=False, methods=["get"])
    def email(self, request):
        return Response({"user_email": request.user.email})

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
