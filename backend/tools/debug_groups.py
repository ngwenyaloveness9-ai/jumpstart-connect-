import os
import traceback
import django
from django.test import RequestFactory
import sys

# Ensure project root (backend) is on sys.path so config.settings can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Configure settings module and initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from jyc_apps.chat.views import GetGroupsView

rf = RequestFactory()
req = rf.get('/api/chat/groups/1')

try:
    resp = GetGroupsView.as_view()(req, user_id=1)
    print('STATUS', getattr(resp, 'status_code', None))
    print(resp.content[:2000])
except Exception:
    traceback.print_exc()
