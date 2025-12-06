from django.db import models
from django.conf import settings


User = settings.AUTH_USER_MODEL

class Chapter(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chapters")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    color = models.CharField(max_length=7, default="#000000")  # timeline color

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    chapters = models.ManyToManyField(Chapter, related_name="events", blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)