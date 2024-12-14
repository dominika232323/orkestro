from django.apps import apps
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group

from .forms import UserChangeForm, UserCreationForm
from .models import User


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ("email", "name", "surname", "is_active", "is_staff", "is_superuser")
    list_filter = ("is_staff", "is_active", "is_superuser")
    fieldsets = (
        (None, {"fields": ("email", "password", "google_user_id")}),
        ("Personal info", {"fields": ("name", "surname")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "surname", "password1", "password2", "is_staff", "is_active", "is_superuser"),
        }),
    )
    search_fields = ("email",)
    ordering = ("email",)
    filter_horizontal = ()


api_models = apps.get_app_config("api").get_models()

for model in api_models:
    admin.site.register(model)

admin.site.unregister(User)  # unregister previously registered User model
admin.site.register(User, UserAdmin)  # register it again with custom admin

# Unregister unused default Django Group model
admin.site.unregister(Group)
