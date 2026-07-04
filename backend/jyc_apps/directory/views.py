from django.http import JsonResponse
from django.views import View
from django.contrib.auth import get_user_model

User = get_user_model()


class GetAllEmployeesView(View):
    def get(self, request):
        employees = User.objects.filter(is_active=True).exclude(role='superadmin')
        data = [{
            "id": e.id,
            "name": f"{e.first_name} {e.last_name}",
            "email": e.email,
            "department": e.department if hasattr(e, 'department') else "",
            "role": e.role if hasattr(e, 'role') else "",
        } for e in employees]

        return JsonResponse({"employees": data, "count": len(data)})


class GetEmployeeView(View):
    def get(self, request, employee_id):
        try:
            e = User.objects.get(id=employee_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)

        return JsonResponse({
            "employee": {
                "id": e.id,
                "name": f"{e.first_name} {e.last_name}",
                "email": e.email,
                "department": e.department if hasattr(e, 'department') else "",
                "role": e.role if hasattr(e, 'role') else "",
            }
        })
