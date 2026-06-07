from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Super Admin APIs
    path('superadmin/', include('superadmin.urls')),

    # Authentication APIs
    path('auth/', include('authentication.urls')),
]