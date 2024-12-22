from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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
    path("", include(router.urls)),
    path("login-google/", views.GoogleLoginView.as_view(), name="api_google_login"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("hello-world/", views.hello_world, name="hello_world"),
    path("hello-protected/", views.hello_protected, name="hello_protected"),
]
