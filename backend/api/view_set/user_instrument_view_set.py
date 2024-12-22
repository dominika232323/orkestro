from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import UserInstrument, Instrument
from api.serializers import UserInstrumentSerializer, InstrumentSerializer


class UserInstrumentViewSet(viewsets.ModelViewSet):
    queryset = UserInstrument.objects.all()
    serializer_class = UserInstrumentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get", "post", "delete"])
    def instruments(self, request):
        if request.method == "GET":
            user = request.user
            user_instruments = user.instruments.all()

            instruments = [ui.instrument for ui in user_instruments]
            serialized_instruments = InstrumentSerializer(instruments, many=True)

            return Response({"instruments": serialized_instruments.data})

        if request.method == "POST":
            try:
                user = request.user
                instrument_name = request.data.get("instrument_name")

                if not instrument_name:
                    raise ValueError("Instrument name cannot be empty")

                if len(instrument_name) > 100:
                    raise ValueError("Instrument name cannot be longer than 100 characters")

                instrument_name = instrument_name.strip()

                instrument, created = Instrument.objects.get_or_create(name=instrument_name)

                if UserInstrument.objects.filter(user=user, instrument=instrument).exists():
                    raise ValueError("This instrument is already associated with the user")

                UserInstrument.objects.create(user=user, instrument=instrument)
                return Response(status=status.HTTP_201_CREATED)

            except ValueError as e:
                return Response(
                    {"error": "Invalid instrument name", "details": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if request.method == "DELETE":
            try:
                user = request.user
                instrument_name = request.data.get("instrument_name")

                if not instrument_name:
                    raise ValueError("Instrument name cannot be empty")

                instrument_name = instrument_name.strip()

                try:
                    instrument = Instrument.objects.get(name__iexact=instrument_name)
                except Instrument.DoesNotExist:
                    raise ValueError("Instrument does not exist")

                user_instrument = UserInstrument.objects.filter(user=user, instrument=instrument).first()

                if not user_instrument:
                    raise ValueError("The user is not associated with the instrument")

                user_instrument.delete()
                return Response(status=status.HTTP_200_OK)

            except ValueError as e:
                return Response(
                    {"error": "Invalid instrument name", "details": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
