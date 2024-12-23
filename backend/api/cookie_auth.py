from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieAuth(JWTAuthentication):
    def authenticate(self, request):
        jwt_token = request.COOKIES.get("access_token")
        if not jwt_token:
            return None
        request.META["HTTP_AUTHORIZATION"] = f"Bearer {jwt_token}"
        return super().authenticate(request)
