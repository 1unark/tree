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
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user, _ = User.objects.get_or_create(
            username='default',
            defaults={'email': 'default@example.com'}
        )
        return Chapter.objects.filter(user=user).select_related(
            'parent_branch', 'source_entry', 'source_chapter'
        ).prefetch_related('entries', 'periods', 'branch_entries')

    def perform_create(self, serializer):
        user, _ = User.objects.get_or_create(
            username='default',
            defaults={'email': 'default@example.com'}
        )
        serializer.save(user=user)

    def perform_destroy(self, instance):
        # Delete all child periods first if this is a branch
        if instance.type == 'branch':
            instance.periods.all().delete()
        instance.delete()

    @action(detail=False, methods=['get'])
    def timeline_data(self, request):
        user, _ = User.objects.get_or_create(
            username='default',
            defaults={'email': 'default@example.com'}
        )
        
        # Get main timeline periods
        main_periods = Chapter.objects.filter(
            user=user,
            type='main_period',
            parent_branch__isnull=True
        ).prefetch_related('entries').order_by('order', 'start_date')
        
        # Get branches with their periods and entries
        branches = Chapter.objects.filter(
            user=user,
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
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user, _ = User.objects.get_or_create(
            username='default',
            defaults={'email': 'default@example.com'}
        )
        return Event.objects.filter(user=user).select_related('chapter', 'branch')

    def perform_create(self, serializer):
        user, _ = User.objects.get_or_create(
            username='default',
            defaults={'email': 'default@example.com'}
        )
        serializer.save(user=user)

    def perform_destroy(self, instance):
        # Also delete any branches that were spawned from this entry
        instance.spawned_branches.all().delete()
        instance.delete()