from django.db import models
from django.conf import settings

# Use CustomUser from users app
try:
    from users.models import CustomUser as User
except ImportError:
    from django.contrib.auth.models import User

class Chapter(models.Model):
    TYPE_CHOICES = [
        ('main_period', 'Main Timeline Period'),
        ('branch', 'Branch (e.g., Career, Relationships)'),
        ('branch_period', 'Branch Period'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chapters")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='main_period')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    color = models.CharField(max_length=7, default="#000000")  # timeline color
    x_position = models.IntegerField(default=0, help_text="X position for branches")
    parent_branch = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='periods', help_text="For branch periods, link to parent branch")
    collapsed = models.BooleanField(default=False)
    order = models.IntegerField(default=0, help_text="Order within same type")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'start_date']

class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    chapter = models.ForeignKey(Chapter, on_delete=models.SET_NULL, related_name="entries", null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    preview = models.TextField(blank=True, null=True, help_text="Short preview text")
    content = models.TextField(blank=True, null=True, help_text="Full content text")
    date = models.DateField()
    order = models.IntegerField(default=0, help_text="Order within chapter")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date', 'order']