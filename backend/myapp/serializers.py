# serializers.py
from rest_framework import serializers
from .models import Chapter, Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'content',
            'date',
            'order',
            'chapter',
            'branch',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ChapterSerializer(serializers.ModelSerializer):
    entries = EventSerializer(many=True, read_only=True)
    branch_entries = EventSerializer(many=True, read_only=True)
    periods = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = [
            'id',
            'type',
            'title',
            'start_date',
            'end_date',
            'color',
            'x_position',
            'parent_branch',
            'source_entry',
            'source_chapter',
            'collapsed',
            'order',
            'entries',
            'branch_entries',
            'periods',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_periods(self, obj):
        """Get child periods for branches"""
        if obj.type == 'branch':
            qs = obj.periods.all().order_by('order', 'start_date')
            return ChapterSerializer(qs, many=True, context=self.context).data
        return []