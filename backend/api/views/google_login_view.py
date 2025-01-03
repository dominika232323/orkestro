from django.conf import settings
from django.utils import timezone
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import status
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
                requests.Request(),
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
