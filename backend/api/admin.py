from django.apps import apps
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group

from .forms import UserChangeForm, UserCreationForm
from .models import Event, EventAttendee, EventTrack, File, FileAllowedMember, FileInstrument, Message, MessageRecipient, User, UserInstrument


class UserInstrumentsInlineAdmin(admin.TabularInline):
    model = UserInstrument
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
    model = MessageRecipient
    extra = 1  # show only 1 empty field for adding new objects


class MessageAdmin(admin.ModelAdmin):
    inlines = [MessageRecipientInlineAdmin]


class EventTrackInlineAdmin(admin.TabularInline):
    model = EventTrack
    extra = 1  # show only 1 empty field for adding new objects


class EventAttendeeInlineAdmin(admin.TabularInline):
    model = EventAttendee
    extra = 1  # show only 1 empty field for adding new objects


class EventAdmin(admin.ModelAdmin):
    inlines = [EventTrackInlineAdmin, EventAttendeeInlineAdmin]


class FileInstrumentInlineAdmin(admin.TabularInline):
    model = FileInstrument
    extra = 1  # show only 1 empty field for adding new objects


class FileAllowedMemberInlineAdmin(admin.TabularInline):
    model = FileAllowedMember
    extra = 1  # show only 1 empty field for adding new objects


class FileAdmin(admin.ModelAdmin):
    inlines = [FileInstrumentInlineAdmin, FileAllowedMemberInlineAdmin]


api_models = apps.get_app_config("api").get_models()

for model in api_models:
    admin.site.register(model)

# unregister previously registered models
admin.site.unregister(User)
admin.site.unregister(Message)
admin.site.unregister(Event)
admin.site.unregister(File)

# register them again with custom admins
admin.site.register(User, UserAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(File, FileAdmin)

# Unregister unused default Django Group model
admin.site.unregister(Group)
