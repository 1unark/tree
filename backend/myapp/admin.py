from django.contrib import admin
from .models import Chapter, Event


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "type",
        "start_date",
        "end_date",
        "order",
        "collapsed",
    )
    list_filter = ("type", "collapsed")
    search_fields = ("content",)
    ordering = ("order", "start_date")
    raw_id_fields = ("user", "parent_branch")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "chapter",
        "date",
        "order",
    )
    list_filter = ("date",)
    search_fields = ("content",)
    ordering = ("date", "order")
    raw_id_fields = ("user", "chapter")
