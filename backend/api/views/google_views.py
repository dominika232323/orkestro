"""
Handles API requests regarding Google authentication.
"""

from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from google.auth.transport.requests import Request
from google.oauth2 import id_token
import requests
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from api.models import User


class GoogleLoginView(APIView):
    authentication_classes = []  # disable JWT authentication for this view

    def post(self, request):
        try:
            credential = request.data.get("credential")
            if not credential:
                return Response(
                    {"error": "Credential is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            info = id_token.verify_oauth2_token(
                credential,
                Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = info["email"]
            name = info["given_name"]
            surname = info.get("family_name", "")
            google_user_id = info["sub"]
            profile_picture_url = info.get("picture", None)

            try:
                user = User.objects.get(email=email)
                created = False

                # verify google user id
                if user.google_user_id and user.google_user_id != google_user_id:
                    return Response(
                        {"error": "Invalid Google user ID"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # verify account is active
                if not user.is_active:
                    return Response(
                        {"error": "User account is disabled"},
                        status=status.HTTP_403_FORBIDDEN
                    )

                # fill in missing fields
                if not user.name:
                    user.name = name
                if not user.surname:
                    user.surname = surname
                if not user.google_user_id:
                    user.google_user_id = google_user_id

                # update every time in case user changed it
                user.profile_picture_url = profile_picture_url

                user.last_login = timezone.now()
                user.save()

            except User.DoesNotExist:
                user = User(
                    email=email,
                    name=name,
                    surname=surname,
                    google_user_id=google_user_id,
                    profile_picture_url=profile_picture_url,
                    date_joined=timezone.now(),
                    last_login=timezone.now(),
                )
                created = True
                user.save()

            refresh_token = RefreshToken.for_user(user)

            return Response(
                {
                    "access_token": str(refresh_token.access_token),
                    "refresh_token": str(refresh_token),
                },
                status=(status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            )

        except ValueError as e:
            return Response(
                {"error": "Bad request", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class GoogleCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Link user's Google Calendar"""

        try:
            authorization_code = request.data.get("authorization_code")
            if not authorization_code:
                return Response({"error": "Authorization code required"}, status=400)

            # Exchange auth code for access token and refresh token
            token_url = "https://oauth2.googleapis.com/token"
            payload = {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": authorization_code,
                "grant_type": "authorization_code",
                "redirect_uri": request.META["HTTP_ORIGIN"],  # must match frontend
            }

            response = requests.post(token_url, data=payload)
            token_data = response.json()

            if "error" in token_data:
                return Response({"error": token_data["error_description"]}, status=400)

            info = id_token.verify_oauth2_token(
                token_data["id_token"],
                Request(),
                settings.GOOGLE_CLIENT_ID
            )
            email = info["email"]

            if not email == request.user.email:
                return Response({"error": "Email does not match"}, status=400)

            user = User.objects.get(email=request.user.email)
            user.gcalendar_is_linked = True
            user.gcalendar_refresh_token = token_data["refresh_token"]
            user.gcalendar_access_token = token_data["access_token"]
            user.gcalendar_token_expiry = timezone.now() + timedelta(seconds=token_data["expires_in"])
            user.save()

            return Response({"message": "Google Calendar linked successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


def refresh_gcalendar_token(user: User):
    """Refresh the Google Calendar OAuth2 access token using the refresh token."""

    try:
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": user.gcalendar_refresh_token,
            "grant_type": "refresh_token",
        }

        response = requests.post(token_url, data=payload)
        new_token_data = response.json()

        user.gcalendar_access_token = new_token_data["access_token"]
        user.gcalendar_token_expiry = timezone.now() + timedelta(seconds=new_token_data["expires_in"])
        user.save()
        return new_token_data["access_token"]

    except Exception as e:
        raise Exception("Failed to refresh Google Calendar token") from e


def get_valid_gcalendar_token(user: User):
    """Get valid Google Calendar OAuth2 token. Refresh it first if needed."""

    if not user.gcalendar_is_linked:
        raise Exception(f"Google Calendar is not linked for user {user.email}")

    if user.gcalendar_token_expiry and timezone.now() < user.gcalendar_token_expiry:
        return user.gcalendar_access_token
    else:
        return refresh_gcalendar_token(user)


def get_calendar_list(user: User):
    """Fetches a list of user's Google Calendars."""

    access_token = get_valid_gcalendar_token(user)

    url = "https://www.googleapis.com/calendar/v3/users/me/calendarList"
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers)
    return response.json()


def create_orkestro_calendar(user: User):
    """Creates a new Orkestro Google Calendar for the user."""

    access_token = get_valid_gcalendar_token(user)

    calendar_data = {
        "summary": "Orkestro",
        "timeZone": settings.TIME_ZONE
    }

    url = "https://www.googleapis.com/calendar/v3/calendars"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=calendar_data, headers=headers)
    return response.json()


def get_or_create_orkestro_calendar(user: User):
    """TODO"""

    calendar_list = get_calendar_list(user)
    orkestro_calendars = [cal for cal in calendar_list["items"] if cal["summary"] == "Orkestro"]

    if orkestro_calendars:
        orkestro_calendar = orkestro_calendars[0]
    else:
        orkestro_calendar = create_orkestro_calendar(user)

    return orkestro_calendar
