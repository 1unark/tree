from rest_framework import viewsets, permissions
from ..models import Arc, Event
from ..serializers import ArcSerializer, EventSerializer

class ArcViewSet(viewsets.ModelViewSet):
    serializer_class = ArcSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Arc.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
