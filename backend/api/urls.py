from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views.debug_views import hello_protected, hello_world
from .views.event_attendee_view_set import EventAttendeeViewSet
from .views.event_track_view_set import EventTrackViewSet
from .views.event_view_set import EventViewSet
from .views.file_allowed_member_view_set import FileAllowedMemberViewSet
from .views.file_instrument_view_set import FileInstrumentViewSet
from .views.file_view_set import FileViewSet
from .views.google_login_view import GoogleLoginView
from .views.group_view_set import GroupViewSet
from .views.instrument_view_set import InstrumentViewSet
from .views.invitation_view_set import InvitationViewSet
from .views.member_view_set import MemberViewSet
from .views.message_recipient_view_set import MessageRecipientViewSet
from .views.message_view_set import MessageViewSet
from .views.track_view_set import TrackViewSet
from .views.user_instrument_view_set import UserInstrumentViewSet
from .views.user_view_set import UserViewSet


router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"groups", GroupViewSet)
router.register(r"events", EventViewSet)
router.register(r"tracks", TrackViewSet)
router.register(r"files", FileViewSet)
router.register(r"instruments", InstrumentViewSet)
router.register(r"messages", MessageViewSet)
router.register(r"event-attendees", EventAttendeeViewSet)
router.register(r"event-tracks", EventTrackViewSet)
router.register(r"file-allowed-members", FileAllowedMemberViewSet)
router.register(r"file-instruments", FileInstrumentViewSet)
router.register(r"invitations", InvitationViewSet)
router.register(r"members", MemberViewSet)
router.register(r"message-recipients", MessageRecipientViewSet)
router.register(r"user-instruments", UserInstrumentViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("login-google/", GoogleLoginView.as_view(), name="api_google_login"),
    path("token-refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("hello-world/", hello_world, name="hello_world"),
    path("hello-protected/", hello_protected, name="hello_protected"),
]
