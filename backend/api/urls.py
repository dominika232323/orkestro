from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

import api.views_user
import api.views_user_events
import api.views_user_instrument
from . import views
from .views import *

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'events', EventViewSet)
router.register(r'tracks', TrackViewSet)
router.register(r'files', FileViewSet)
router.register(r'instruments', InstrumentViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'event-attendees', EventAttendeeViewSet)
router.register(r'event-tracks', EventTrackViewSet)
router.register(r'file-allowed-members', FileAllowedMemberViewSet)
router.register(r'file-instruments', FileInstrumentViewSet)
router.register(r'invitations', InvitationViewSet)
router.register(r'members', MemberViewSet)
router.register(r'message-recipients', MessageRecipientViewSet)
router.register(r'user-instruments', UserInstrumentViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path("login-google/", views.GoogleLoginView.as_view(), name="api_google_login"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("hello-world/", views.hello_world, name="hello_world"),
    path("hello-protected/", views.hello_protected, name="hello_protected"),
    # path("user-name/", api.views_user.user_name, name="user_name"),
    # path("user-surname/", api.views_user.user_surname, name="user_surname"),
    # path("user-email/", api.views_user.user_email, name="user_email"),
    # path("user-google-calendar-id/", api.views_user.user_google_calendar_id, name="user_google_calendar_id"),
    # path("update-user-name/", api.views_user.update_user_name, name="update_user_name"),
    # path("update-user-surname/", api.views_user.update_user_surname, name="update_user_surname"),
    # path("update-user-email/", api.views_user.update_user_email, name="update_user_email"),
    # path("update-user-google-calendar-id/", api.views_user.update_user_google_calendar_id, name="update_user_google_calendar_id"),
    # path("user-instruments/", api.views_user_instrument.user_instruments, name="user_instruments"),
    # path("add-user-instrument-by-name/", api.views_user_instrument.add_user_instrument_by_name, name="add_user_instrument_by_name"),
    # path("delete-user-instrument-by-name/", api.views_user_instrument.delete_user_instrument_by_name, name="delete_user_instrument_by_name"),
    # path("user_events/", api.views_user_events.user_events, name="user_events"),
]
