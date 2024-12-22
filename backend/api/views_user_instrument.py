from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import UserInstrument, Instrument


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_instruments(request):
    user = request.user
    user_instruments = UserInstrument.objects.filter(user=user).select_related("instrument")

    instruments_data = [
        {
            "instrument_id": user_instrument.instrument.instrument_id,
            "name": user_instrument.instrument.name,
        }
        for user_instrument in user_instruments
    ]

    return Response({"instruments": instruments_data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_user_instrument_by_name(request):
    try:
        user = request.user
        instrument_name = request.data.get("instrument_name")

        if not instrument_name:
            return Response(
                {"error": "instrument_name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(instrument_name) > 100:
            return Response(
                {"error": "instrument_name cannot exceed 50 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        instrument_name = instrument_name.strip()

        instrument, created = Instrument.objects.get_or_create(name=instrument_name)

        if UserInstrument.objects.filter(user=user, instrument=instrument).exists():
            return Response(
                {"error": "This instrument is already associated with the user"},
                status=status.HTTP_400_BAD_REQUEST
            )

        UserInstrument.objects.create(user=user, instrument=instrument)

        return Response(
            {"message": f"Instrument '{instrument_name}' added successfully"},
            status=status.HTTP_201_CREATED
        )
    except ValueError as e:
        return Response(
            {"error": "Invalid instrument name", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_instrument_by_name(request):
    try:
        user = request.user
        instrument_name = request.data.get("instrument_name")

        if not instrument_name:
            return Response(
                {"error": "instrument_name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        instrument_name = instrument_name.strip()

        try:
            instrument = Instrument.objects.get(name__iexact=instrument_name)
        except Instrument.DoesNotExist:
            return Response(
                {"error": f"Instrument '{instrument_name}' does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )

        user_instrument = UserInstrument.objects.filter(user=user, instrument=instrument).first()

        if not user_instrument:
            return Response(
                {"error": f"The user is not associated with the instrument '{instrument_name}'"},
                status=status.HTTP_404_NOT_FOUND
            )

        user_instrument.delete()

        return Response(
            {"message": f"Instrument '{instrument_name}' association removed successfully"},
            status=status.HTTP_200_OK
        )
    except ValueError as e:
        return Response(
            {"error": "Invalid instrument name", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
