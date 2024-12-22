from django.conf import settings
from django.utils import timezone
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import *


class GoogleLoginView(APIView):
    def post(self, request):
        try:
            credential = request.data.get("credential")
            if not credential:
                return Response(
                    {"error": "Credential is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            idinfo = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = idinfo.get("email")
            name = idinfo.get("given_name")
            surname = idinfo.get("family_name", "")
            google_user_id = idinfo.get("sub")

            user, created = User.objects.get_or_create(
                email = email,
                defaults = {
                    "name": name,
                    "surname": surname,
                    "google_user_id": google_user_id,
                    "is_active": True,
                }
            )

            if user.google_user_id and user.google_user_id != google_user_id:
                return Response(
                    {"error": "Invalid Google user ID"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not created:
                if not user.name:
                    user.name = name
                if not user.surname:
                    user.surname = surname
                if not user.google_user_id:
                    user.google_user_id = google_user_id
            user.last_login = timezone.now()
            user.save()

            if not user.is_active:
                return Response(
                    {"error": "User account is disabled"},
                    status=status.HTTP_403_FORBIDDEN
                )

            refresh = RefreshToken.for_user(user)

            return Response({
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            })

        except ValueError as e:
            return Response(
                {"error": "Invalid token", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(["GET"])
def hello_world(request):
    return Response({"text": "Hello, world!"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hello_protected(request):
    return Response({"text": f"Hello, {request.user.email}!"})


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


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]


class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated]


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]


class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer
    permission_classes = [IsAuthenticated]


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]


class EventAttendeeViewSet(viewsets.ModelViewSet):
    queryset = EventAttendee.objects.all()
    serializer_class = EventAttendeeSerializer
    permission_classes = [IsAuthenticated]


class EventTrackViewSet(viewsets.ModelViewSet):
    queryset = EventTrack.objects.all()
    serializer_class = EventTrackSerializer
    permission_classes = [IsAuthenticated]


class FileAllowedMemberViewSet(viewsets.ModelViewSet):
    queryset = FileAllowedMember.objects.all()
    serializer_class = FileAllowedMemberSerializer
    permission_classes = [IsAuthenticated]


class FileInstrumentViewSet(viewsets.ModelViewSet):
    queryset = FileInstrument.objects.all()
    serializer_class = FileInstrumentSerializer
    permission_classes = [IsAuthenticated]


class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]


class MessageRecipientViewSet(viewsets.ModelViewSet):
    queryset = MessageRecipient.objects.all()
    serializer_class = MessageRecipientSerializer
    permission_classes = [IsAuthenticated]


class UserInstrumentViewSet(viewsets.ModelViewSet):
    queryset = UserInstrument.objects.all()
    serializer_class = UserInstrumentSerializer
    permission_classes = [IsAuthenticated]
