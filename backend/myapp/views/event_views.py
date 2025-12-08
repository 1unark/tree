from rest_framework import viewsets, permissions
from ..models import Chapter, Event
from ..serializers import ChapterSerializer, EventSerializer

class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.AllowAny]  # Change to IsAuthenticated in production

    def get_queryset(self):
        # For now, return all chapters. In production, filter by user
        return Chapter.objects.all()

    def perform_create(self, serializer):
        # For development: get or create a default user
        # In production, use: serializer.save(user=self.request.user)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username='default',
            defaults={'email': 'default@example.com'}
        )
        serializer.save(user=user)

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]  # Change to IsAuthenticated in production

    def get_queryset(self):
        # For now, return all events. In production, filter by user
        return Event.objects.all()

    def perform_create(self, serializer):
        # For development: get or create a default user
        # In production, use: serializer.save(user=self.request.user)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username='default',
            defaults={'email': 'default@example.com'}
        )
        serializer.save(user=user)
