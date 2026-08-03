import os, sys, inspect
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from jyc_apps.chat.views import GetGroupsView
print('--- GetGroupsView source ---')
print(inspect.getsource(GetGroupsView))
