from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import User


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_name(request):
    return Response({"user_name": request.user.name})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user_name(request):
    try:
        new_name = request.data.get("name")

        if not new_name:
            return Response(
                {"error": "Name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_name) > 50:
            return Response(
                {"error": "Name cannot exceed 50 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.name = new_name
        request.user.save()

        return Response({
            "message": "User name updated successfully",
            "user_name": request.user.name
        })
    except ValueError as e:
        return Response(
            {"error": "Invalid name", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_surname(request):
    return Response({"user_surname": request.user.surname})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user_surname(request):
    try:
        new_surname = request.data.get("surname")

        if not new_surname:
            return Response(
                {"error": "Surname is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_surname) > 50:
            return Response(
                {"error": "Surname cannot exceed 50 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.surname = new_surname
        request.user.save()

        return Response({
            "message": "User surname updated successfully",
            "user_surname": request.user.surname
        })
    except ValueError as e:
        return Response(
            {"error": "Invalid surname", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_email(request):
    return Response({"user_email": request.user.email})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user_email(request):
    try:
        new_email = request.data.get("email")

        if not new_email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_email) > 100:
            return Response(
                {"error": "Email cannot exceed 100 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_email(new_email)
        except ValidationError as e:
            return Response(
                {"error": "Invalid email", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=new_email).exists():
            return Response(
                {"error": "Email already in use"},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.email = new_email
        request.user.save()

        return Response({
            "message": "User email updated successfully",
            "user_email": request.user.email
        })
    except ValueError as e:
        return Response(
            {"error": "Invalid email", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_google_calendar_id(request):
    return Response({"user_google_calendar_id": request.user.google_calendar_id})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user_google_calendar_id(request):
    try:
        new_google_calendar_id = request.data.get("google_calendar_id")

        if new_google_calendar_id is not None and len(new_google_calendar_id) > 1024:
            return Response(
                {"error": "Google Calendar ID cannot exceed 1024 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.google_calendar_id = new_google_calendar_id
        request.user.save()

        return Response({
            "message": "User Google Calendar ID updated successfully",
            "user_google_calendar_id": request.user.google_calendar_id
        })
    except ValueError as e:
        return Response(
            {"error": "Invalid Google Calendar ID", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
