from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from api.models import Group
from api.serializers import GroupSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
