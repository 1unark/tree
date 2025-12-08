from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.event_views import ChapterViewSet, EventViewSet

router = DefaultRouter()
router.register(r'chapters', ChapterViewSet, basename='chapter')
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
]

