# models.py
from django.db import models
from django.conf import settings

try:
    from users.models import CustomUser as User
except ImportError:
    from django.contrib.auth.models import User

class Chapter(models.Model):
    TYPE_CHOICES = [
        ('main_period', 'Main Period'),
        ('branch', 'Branch'),
        ('branch_period', 'Branch Period'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chapters")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='main_period')
    title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    color = models.CharField(max_length=7, default="#3B82F6")
    x_position = models.IntegerField(default=0)
    
    # For branch periods - which branch they belong to
    parent_branch = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='periods',
        limit_choices_to={'type': 'branch'}
    )
    
    # For branches - what they branched from
    source_entry = models.ForeignKey(
        'Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='spawned_branches'
    )
    source_chapter = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chapter_spawned_branches'
    )
    
    collapsed = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'start_date']
        
    def __str__(self):
        return self.title


class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    
    # Chapter is optional - entries can exist in branches without chapters
    chapter = models.ForeignKey(
        Chapter, 
        on_delete=models.SET_NULL, 
        related_name="entries",
        null=True, 
        blank=True
    )
    
    # Direct branch assignment for entries in branches without chapters
    branch = models.ForeignKey(
        Chapter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='branch_entries',
        limit_choices_to={'type': 'branch'}
    )
    
    title = models.CharField(max_length=255)
    date = models.DateField()
    content = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'order']

    def __str__(self):
        return self.title