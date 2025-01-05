from django.contrib.auth import get_user_model
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import UntypedToken


class JWTCookieMiddleware(MiddlewareMixin):
    """
    Authenticate user based on the JWT present in cookies (for admin panel)
    """

    def process_request(self, request):
        jwt_token = request.COOKIES.get("access_token")
        if jwt_token:
            try:
                payload = UntypedToken(jwt_token)
                user_id = payload.get("user_id")
                if user_id:
                    user = get_user_model().objects.get(pk=user_id)
                    request.user = user
            except Exception:
                pass  # invalid token; user remains unauthenticated


class JWTCookieAuth(JWTAuthentication):
    """
    Authenticate user based on the JWT present in cookies (for API requests)
    """

    def authenticate(self, request):
        jwt_token = request.COOKIES.get("access_token")
        if not jwt_token:
            return None
        request.META["HTTP_AUTHORIZATION"] = f"Bearer {jwt_token}"
        return super().authenticate(request)
