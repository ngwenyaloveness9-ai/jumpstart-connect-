# HOW TO PLUG THESE APPS INTO THE JYC DJANGO PROJECT
# =====================================================

# STEP 1 — Copy the 4 app folders into Loveness's backend
# --------------------------------------------------------
# Copy: chat/  announcements/  files/  directory/
# Into: jumpstart-platform/backend/   (same level as the 'users' app)


# STEP 2 — Add to INSTALLED_APPS in settings.py
# -----------------------------------------------
INSTALLED_APPS = [
    # ... existing apps ...
    'chat',
    'announcements',
    'files',
    'directory',
]


# STEP 3 — Add to urls.py (main urls.py of the project)
# -------------------------------------------------------
from django.urls import path, include

urlpatterns = [
    # ... existing urls ...
    path('chat/', include('chat.urls')),
    path('announcements/', include('announcements.urls')),
    path('files/', include('files.urls')),
    path('directory/', include('directory.urls')),
]


# STEP 4 — Add MEDIA settings to settings.py (for file uploads)
# --------------------------------------------------------------
import os
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# STEP 5 — Add media URL to main urls.py
# ----------------------------------------
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# STEP 6 — Run migrations
# ------------------------
# python manage.py makemigrations chat announcements files
# python manage.py migrate


# STEP 7 — Test in Postman
# -------------------------
# POST   http://127.0.0.1:8000/chat/send
# GET    http://127.0.0.1:8000/chat/inbox/{user_id}
# GET    http://127.0.0.1:8000/chat/conversation/{user1_id}/{user2_id}
# POST   http://127.0.0.1:8000/announcements/create
# GET    http://127.0.0.1:8000/announcements/all
# DELETE http://127.0.0.1:8000/announcements/{id}
# POST   http://127.0.0.1:8000/files/upload
# GET    http://127.0.0.1:8000/files/all
# DELETE http://127.0.0.1:8000/files/{id}
# GET    http://127.0.0.1:8000/directory/all
# GET    http://127.0.0.1:8000/directory/{employee_id}
