from django.urls import path

from .views import (
    VerifyOTPView,
    CreatePasswordView,
    LoginView,
    ChangePasswordView,
    MeView,
    LogoutView
)

urlpatterns = [
    path("verify-otp/", VerifyOTPView.as_view()),
    path("create-password/", CreatePasswordView.as_view()),
    path("login/", LoginView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("me/", MeView.as_view()),
    path("logout/", LogoutView.as_view()),
]