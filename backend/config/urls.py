"""
URL configuration for config project.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('superadmin.urls')),
    path('api/auth/', include('authentication.urls')),
    # Phase 3 APIs
    path("api/chat/", include("jyc_apps.chat.urls")),
    path('announcements/', include('jyc_apps.announcements.urls')),
    path('files/', include('jyc_apps.files.urls')),
    path('directory/', include('jyc_apps.directory.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)