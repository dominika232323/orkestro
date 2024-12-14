from django.conf import settings
from django.utils import timezone
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


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
            user_name = idinfo.get("given_name")
            user_surname = idinfo.get("family_name", "")
            google_user_id = idinfo.get("sub")

            user, created = User.objects.get_or_create(
                email = email,
                defaults = {
                    "user_name": user_name,
                    "user_surname": user_surname,
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
                if not user.user_name:
                    user.user_name = user_name
                if not user.user_surname:
                    user.user_surname = user_surname
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
