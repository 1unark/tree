# viewsets.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..models import Chapter, Event
from ..serializers import ChapterSerializer, EventSerializer

User = get_user_model()

class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]  # Changed from AllowAny

    def get_queryset(self):
        # Remove the get_or_create, use the actual authenticated user
        return Chapter.objects.filter(user=self.request.user).select_related(
            'parent_branch', 'source_entry', 'source_chapter'
        ).prefetch_related('entries', 'periods', 'branch_entries')

    def perform_create(self, serializer):
        # Remove the get_or_create, use the actual authenticated user
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.type == 'branch':
            instance.periods.all().delete()
        instance.delete()

    @action(detail=False, methods=['get'])
    def timeline_data(self, request):
        # Remove the get_or_create, use the actual authenticated user
        main_periods = Chapter.objects.filter(
            user=request.user,  # Changed
            type='main_period',
            parent_branch__isnull=True
        ).prefetch_related('entries').order_by('order', 'start_date')
        
        branches = Chapter.objects.filter(
            user=request.user,  # Changed
            type='branch',
            parent_branch__isnull=True
        ).prefetch_related(
            'periods__entries',
            'branch_entries'
        ).order_by('order', 'start_date')
        
        return Response({
            'main_timeline': ChapterSerializer(main_periods, many=True).data,
            'branches': ChapterSerializer(branches, many=True).data,
        })


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]  # Changed from AllowAny

    def get_queryset(self):
        # Remove the get_or_create, use the actual authenticated user
        return Event.objects.filter(user=self.request.user).select_related('chapter', 'branch')

    def perform_create(self, serializer):
        # Remove the get_or_create, use the actual authenticated user
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.spawned_branches.all().delete()
        instance.delete()