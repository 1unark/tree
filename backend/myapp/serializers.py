from rest_framework import serializers
from .models import Chapter, Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'content',
            'date',
            'order',
            'chapter',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ChapterSerializer(serializers.ModelSerializer):
    entries = EventSerializer(many=True, read_only=True)
    periods = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = [
            'id',
            'type',
            'content',
            'start_date',
            'end_date',
            'color',
            'x_position',
            'parent_branch',
            'collapsed',
            'order',
            'entries',
            'periods',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_periods(self, obj):
        if obj.type == 'branch':
            qs = Chapter.objects.filter(
                parent_branch=obj,
                type='branch_period'
            )
            return ChapterSerializer(qs, many=True).data
        return []
