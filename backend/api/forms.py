from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.utils import timezone

from .models import User


class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput, required=False)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput, required=False)

    class Meta:
        model = User
        fields = ("email", "user_name", "user_surname", "is_active", "is_staff", "is_superuser")

    def clean_password2(self):
        """Ensure the two password entries match."""
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords do not match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        if password1 := self.cleaned_data["password1"]:
            user.set_password(password1)
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
        fields = ("email", "user_name", "user_surname", "password", "is_active", "is_staff", "is_superuser")

    def clean_password(self):
        """Return the initial value of the password field."""
        return self.initial["password"]
