from django.urls import path
from .views import CreateEmployeeView

urlpatterns = [
    path(
        "employees/create/",
        CreateEmployeeView.as_view()
    ),
]