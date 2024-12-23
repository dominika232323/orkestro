from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import FileAllowedMember
from api.serializers import FileAllowedMemberSerializer


class FileAllowedMemberViewSet(viewsets.ModelViewSet):
    queryset = FileAllowedMember.objects.all()
    serializer_class = FileAllowedMemberSerializer
    permission_classes = [IsAuthenticated]
