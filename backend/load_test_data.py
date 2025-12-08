"""
Script to load test data from TimelineFlow sampleData into the database.
Run this after migrations: python manage.py shell < load_test_data.py
Or: python manage.py shell, then copy-paste this code
"""

import os
import django
from datetime import datetime, date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangostuff.settings')
django.setup()

from django.contrib.auth import get_user_model
from myapp.models import Chapter, Event

User = get_user_model()

# Get or create a test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com'}
)
if created:
    user.set_password('testpass123')
    user.save()

# Clear existing data (optional - comment out if you want to keep existing data)
# Chapter.objects.filter(user=user).delete()
# Event.objects.filter(user=user).delete()

# Sample data structure matching TimelineFlow
sample_data = {
    'mainTimeline': [
        {
            'id': 'period-childhood',
            'title': 'Childhood',
            'dateRange': '2000 - 2005',
            'startDate': date(2000, 1, 1),
            'endDate': date(2005, 9, 1),
            'entries': [
                {'id': 'm1', 'date': date(2000, 1, 1), 'title': "Born", 'preview': "Entered the world on a cold January morning...", 'content': "Entered the world on a cold January morning. Mom says I came three weeks early."},
                {'id': 'm1a', 'date': date(2001, 4, 12), 'title': "First Steps", 'preview': "Took my first wobbly steps...", 'content': "Took my first wobbly steps across the living room. Dad caught it on camera."},
                {'id': 'm2', 'date': date(2002, 6, 15), 'title': "First Words", 'preview': "Started talking, said 'dada' first...", 'content': "Started talking, said 'dada' first much to mom's dismay."},
            ]
        },
        {
            'id': 'period-education',
            'title': 'School Years',
            'dateRange': '2005 - 2016',
            'startDate': date(2005, 9, 1),
            'endDate': date(2016, 6, 15),
            'entries': [
                {'id': 'm4a', 'date': date(2006, 4, 15), 'title': "Science Fair Win", 'preview': "My volcano project won first place...", 'content': "My volcano project won first place. Mom helped me build it in the garage."},
                {'id': 'm6', 'date': date(2011, 9, 1), 'title': "High School Begins", 'preview': "Freshman year. Walking through those doors...", 'content': "Freshman year. Walking through those doors was terrifying and exhilarating."},
            ]
        },
    ],
    'branches': [
        {
            'id': 1,
            'name': "Career",
            'x': 720,
            'color': "#3b82f6",
            'periods': [
                {
                    'id': 'career-early',
                    'title': 'Early Career',
                    'startDate': date(2016, 7, 1),
                    'endDate': date(2020, 1, 1),
                    'entries': [
                        {'id': 18, 'date': date(2016, 7, 1), 'title': "First Job at TechCorp", 'preview': "Junior developer role...", 'content': "Junior developer role. Terrified but excited. First PR took 6 hours."},
                        {'id': 20, 'date': date(2018, 3, 1), 'title': "Promoted to Senior", 'preview': "Finally felt like I knew what I was doing...", 'content': "Finally felt like I knew what I was doing. Leading projects, mentoring juniors."},
                    ]
                },
            ]
        },
    ]
}

# Create main timeline periods
for period_data in sample_data['mainTimeline']:
    chapter, created = Chapter.objects.get_or_create(
        user=user,
        title=period_data['title'],
        defaults={
            'type': 'main_period',
            'start_date': period_data['startDate'],
            'end_date': period_data['endDate'],
            'color': '#000000',
            'collapsed': False,
        }
    )
    
    # Create entries for this period
    for entry_data in period_data.get('entries', []):
        Event.objects.get_or_create(
            user=user,
            title=entry_data['title'],
            defaults={
                'chapter': chapter,
                'date': entry_data['date'],
                'preview': entry_data.get('preview', ''),
                'content': entry_data.get('content', ''),
                'description': entry_data.get('preview', ''),
            }
        )

# Create branches
for branch_data in sample_data['branches']:
    branch, created = Chapter.objects.get_or_create(
        user=user,
        title=branch_data['name'],
        defaults={
            'type': 'branch',
            'start_date': date(2016, 1, 1),  # Default dates
            'end_date': date(2024, 12, 31),
            'color': branch_data['color'],
            'x_position': branch_data['x'],
            'collapsed': False,
        }
    )
    
    # Create branch periods
    for period_data in branch_data.get('periods', []):
        branch_period, created = Chapter.objects.get_or_create(
            user=user,
            title=period_data['title'],
            parent_branch=branch,
            defaults={
                'type': 'branch_period',
                'start_date': period_data['startDate'],
                'end_date': period_data['endDate'],
                'color': branch.color,
                'collapsed': False,
            }
        )
        
        # Create entries for branch period
        for entry_data in period_data.get('entries', []):
            Event.objects.get_or_create(
                user=user,
                title=entry_data['title'],
                defaults={
                    'chapter': branch_period,
                    'date': entry_data['date'],
                    'preview': entry_data.get('preview', ''),
                    'content': entry_data.get('content', ''),
                    'description': entry_data.get('preview', ''),
                }
            )

print("Test data loaded successfully!")
print(f"Created {Chapter.objects.filter(user=user).count()} chapters")
print(f"Created {Event.objects.filter(user=user).count()} events")

