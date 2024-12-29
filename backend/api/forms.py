from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.utils import timezone

from .models import User


class UserCreationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ("email", "name", "surname", "is_active", "is_staff", "is_superuser")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.date_joined = timezone.now()
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(label="Password", help_text=(
        "Passwords are not stored in plaintext, so you cannot see the password. "
        "You can change the password using <a href='../password/'>this form</a>."
    ))

    class Meta:
        model = User
        fields = ("email", "name", "surname", "password", "is_active", "is_staff", "is_superuser")

    def clean_password(self):
        """Return the initial value of the password field."""
        return self.initial["password"]
