from django.apps import apps
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group as DjangoGroup

from . import models
from .forms import UserChangeForm, UserCreationForm


class UserInstrumentsInlineAdmin(admin.TabularInline):
    model = models.UserInstrument
    extra = 1  # show only 1 empty field for adding new objects


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    ordering = ("email",)
    list_display = ("email", "name", "surname", "is_active", "is_staff", "is_superuser")
    list_filter = ("is_staff", "is_active", "is_superuser")
    filter_horizontal = ()
    search_fields = ("email", "name", "surname")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "surname")}),
        ("Google", {"fields": ("profile_picture_url", "google_user_id", "google_calendar_id")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    inlines = [UserInstrumentsInlineAdmin]

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "surname", "is_staff", "is_active", "is_superuser"),
        }),
    )


class MessageRecipientInlineAdmin(admin.TabularInline):
    model = models.MessageRecipient
    extra = 1  # show only 1 empty field for adding new objects


class MessageAdmin(admin.ModelAdmin):
    inlines = [MessageRecipientInlineAdmin]


class EventTrackInlineAdmin(admin.TabularInline):
    model = models.EventTrack
    extra = 1  # show only 1 empty field for adding new objects


class EventAttendeeInlineAdmin(admin.TabularInline):
    model = models.EventAttendee
    extra = 1  # show only 1 empty field for adding new objects


class EventAdmin(admin.ModelAdmin):
    inlines = [EventTrackInlineAdmin, EventAttendeeInlineAdmin]


class FileInstrumentInlineAdmin(admin.TabularInline):
    model = models.FileInstrument
    extra = 1  # show only 1 empty field for adding new objects


class FileAllowedMemberInlineAdmin(admin.TabularInline):
    model = models.FileAllowedMember
    extra = 1  # show only 1 empty field for adding new objects


class FileAdmin(admin.ModelAdmin):
    inlines = [FileInstrumentInlineAdmin, FileAllowedMemberInlineAdmin]


# unregister unused default Django Group model
admin.site.unregister(DjangoGroup)

# register models with default admin panels
for model in [
    models.Group,
    models.Track,
    models.Instrument,
    models.EventAttendee,
    models.EventTrack,
    models.FileAllowedMember,
    models.FileInstrument,
    models.Invitation,
    models.Member,
    models.MessageRecipient,
    models.UserInstrument
]:
    admin.site.register(model)

# register models with custom admin panels
admin.site.register(models.User, UserAdmin)
admin.site.register(models.Message, MessageAdmin)
admin.site.register(models.Event, EventAdmin)
admin.site.register(models.File, FileAdmin)
