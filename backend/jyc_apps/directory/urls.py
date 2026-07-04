from django.urls import path
from .views import GetAllEmployeesView, GetEmployeeView

urlpatterns = [
    path('all', GetAllEmployeesView.as_view(), name='directory-all'),
    path('<int:employee_id>', GetEmployeeView.as_view(), name='directory-employee'),
]
