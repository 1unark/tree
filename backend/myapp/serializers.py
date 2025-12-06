from rest_framework import serializers
from .models import Chapter, Event, Arc

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"

class ChapterSerializer(serializers.ModelSerializer):
    events = EventSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = "__all__"