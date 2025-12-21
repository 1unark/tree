from django.db import models
from django.conf import settings

# Use CustomUser from users app if available
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
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    color = models.CharField(max_length=7, default="#000000")
    x_position = models.IntegerField(default=0)
    parent_branch = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='periods'
    )
    collapsed = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    # Sensitive / future-proof
    content = models.JSONField(default=dict)
    is_encrypted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'start_date']
        
    def __str__(self):
        return (
            self.content.get("title", f"Event {self.pk}")
            if isinstance(self.content, dict)
            else f"Event {self.pk}"
        )



class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    chapter = models.ForeignKey(
        Chapter, on_delete=models.SET_NULL, related_name="entries",
        null=True, blank=True
    )
    
    date = models.DateField()
    order = models.IntegerField(default=0)

    content = models.JSONField(default=dict)
    is_encrypted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'order']

    def __str__(self):
        return (
            self.content.get("title", f"Event {self.pk}")
            if isinstance(self.content, dict)
            else f"Event {self.pk}"
        )
