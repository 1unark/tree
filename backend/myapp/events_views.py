from rest_framework import viewsets, permissions
from .models import Chapter, Event, Arc
from .serializers import ChapterSerializer, EventSerializer, ArcSerializer

class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chapter.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)