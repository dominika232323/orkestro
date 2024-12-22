from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views


urlpatterns = [
    path("login-google/", views.GoogleLoginView.as_view(), name="api_google_login"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("hello-world/", views.hello_world, name="hello_world"),
    path("hello-protected/", views.hello_protected, name="hello_protected"),
    path("user-name/", views.user_name, name="user_name"),
    path("user-surname/", views.user_surname, name="user_surname"),
    path("user-email/", views.user_email, name="user_email"),
    path("user-google-calendar-id/", views.user_google_calendar_id, name="user_google_calendar_id"),
    path("update-user-name/", views.update_user_name, name="update_user_name"),
    path("update-user-surname/", views.update_user_surname, name="update_user_surname"),
    path("update-user-email/", views.update_user_email, name="update_user_email"),
    path("update-user-google-calendar-id/", views.update_user_google_calendar_id, name="update_user_google_calendar_id"),
    path("user-instruments/", views.user_instruments, name="user_instruments"),
    path("add-user-instrument-by-name/", views.add_user_instrument_by_name, name="add_user_instrument_by_name"),
    path("remove-user-instrument-by-name/", views.remove_user_instrument_by_name, name="remove_user_instrument_by_name"),
]
