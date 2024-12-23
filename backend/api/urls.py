from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views
from .view_set.event_attendee_view_set import EventAttendeeViewSet
from .view_set.event_track_view_set import EventTrackViewSet
from .view_set.event_view_set import EventViewSet
from .view_set.file_allowed_member_view_set import FileAllowedMemberViewSet
from .view_set.file_instrument_view_set import FileInstrumentViewSet
from .view_set.file_view_set import FileViewSet
from .view_set.group_view_set import GroupViewSet
from .view_set.instrument_view_set import InstrumentViewSet
from .view_set.invitation_view_set import InvitationViewSet
from .view_set.member_view_set import MemberViewSet
from .view_set.message_recipient_view_set import MessageRecipientViewSet
from .view_set.message_view_set import MessageViewSet
from .view_set.track_view_set import TrackViewSet
from .view_set.user_instrument_view_set import UserInstrumentViewSet
from .view_set.user_view_set import UserViewSet

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
    path("login-google/", views.GoogleLoginView.as_view(), name="api_google_login"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("hello-world/", views.hello_world, name="hello_world"),
    path("hello-protected/", views.hello_protected, name="hello_protected"),
]
