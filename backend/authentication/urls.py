from django.urls import path

from .views import (
    VerifyOTPView,
    CreatePasswordView,
    LoginView,
    ChangePasswordView
)

urlpatterns = [
    path("verify-otp/", VerifyOTPView.as_view()),
    path("create-password/", CreatePasswordView.as_view()),
    path("login/", LoginView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
]