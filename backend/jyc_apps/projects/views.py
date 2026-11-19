from django.db.models import Count, Q
from django.http import Http404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from .models import ImplementationPlanItem, Project, Task, TaskAttachment, TaskComment
from .serializers import (
    ProjectDirectorySerializer,
    ProjectSerializer,
    ImplementationPlanItemSerializer,
    TaskAttachmentSerializer,
    TaskCommentSerializer,
    TaskSerializer,
    UserSummarySerializer,
)


MANAGER_ROLES = {"manager", "department manager", "head of department", "supervisor", "head of technology"}
ADMIN_ROLES = {"superadmin", "admin", "administrator"}
TASK_TRANSITIONS = {
    "To Do": {"In Progress"},
    "In Progress": {"Review"},
    "Review": {"In Progress", "Done"},
    "Done": set(),
}


def role_of(user):
    return (user.role or "").strip().lower()


def is_admin(user):
    return user.is_superuser or role_of(user) in ADMIN_ROLES


def is_department_manager(user):
    return role_of(user) in MANAGER_ROLES


def project_queryset(user):
    projects = Project.objects.select_related("leader", "created_by").prefetch_related("members")
    if is_admin(user):
        return projects.annotate(task_count=Count("tasks", distinct=True), completed_task_count=Count("tasks", filter=Q(tasks__status="Done"), distinct=True), plan_item_count=Count("implementation_plan", distinct=True))
    department_projects = Q(department__iexact=(user.department or "")) & Q(department__gt="")
    if is_department_manager(user):
        visible = department_projects
    else:
        visible = Q(leader=user) | Q(created_by=user) | Q(members=user)
    return projects.filter(visible).distinct().annotate(
        task_count=Count("tasks", distinct=True),
        completed_task_count=Count("tasks", filter=Q(tasks__status="Done"), distinct=True),
        plan_item_count=Count("implementation_plan", distinct=True),
    )


def can_manage_project(user, project):
    return is_admin(user) or project.leader_id == user.id or (
        is_department_manager(user) and project.department.casefold() == (user.department or "").casefold()
    )


def get_visible_project(user, project_id):
    try:
        return project_queryset(user).get(pk=project_id)
    except Project.DoesNotExist as exc:
        raise Http404 from exc


def get_visible_task(user, task_id):
    try:
        return Task.objects.select_related("project", "assignee", "created_by").prefetch_related("comments__author", "attachments__uploaded_by").get(
            pk=task_id, project__in=project_queryset(user)
        )
    except Task.DoesNotExist as exc:
        raise Http404 from exc


def get_visible_plan_item(user, item_id):
    try:
        return ImplementationPlanItem.objects.select_related("project", "responsible_person", "created_by").get(
            pk=item_id, project__in=project_queryset(user)
        )
    except ImplementationPlanItem.DoesNotExist as exc:
        raise Http404 from exc


class ImplementationPlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_visible_project(request.user, project_id)
        items = project.implementation_plan.select_related("responsible_person", "created_by").all()
        return Response(ImplementationPlanItemSerializer(items, many=True).data)

    def post(self, request, project_id):
        project = get_visible_project(request.user, project_id)
        if not can_manage_project(request.user, project):
            return Response({"error": "Only the project leader or department head can manage the implementation plan."}, status=status.HTTP_403_FORBIDDEN)
        serializer = ImplementationPlanItemSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        responsible_person = serializer.validated_data.get("responsible_person")
        if responsible_person and responsible_person.pk not in set(project.members.values_list("pk", flat=True)) | {project.leader_id}:
            return Response({"error": "The responsible person must be the project leader or a project member."}, status=status.HTTP_400_BAD_REQUEST)
        item = serializer.save(project=project, created_by=request.user)
        return Response(ImplementationPlanItemSerializer(item).data, status=status.HTTP_201_CREATED)


class ImplementationPlanDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        item = get_visible_plan_item(request.user, item_id)
        if not can_manage_project(request.user, item.project):
            return Response({"error": "Only the project leader or department head can manage the implementation plan."}, status=status.HTTP_403_FORBIDDEN)
        serializer = ImplementationPlanItemSerializer(item, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        responsible_person = serializer.validated_data.get("responsible_person", item.responsible_person)
        if responsible_person and responsible_person.pk not in set(item.project.members.values_list("pk", flat=True)) | {item.project.leader_id}:
            return Response({"error": "The responsible person must be the project leader or a project member."}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(ImplementationPlanItemSerializer(item).data)

    def delete(self, request, item_id):
        item = get_visible_plan_item(request.user, item_id)
        if not can_manage_project(request.user, item.project):
            return Response({"error": "Only the project leader or department head can manage the implementation plan."}, status=status.HTTP_403_FORBIDDEN)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.select_related("leader").annotate(
            plan_item_count=Count("implementation_plan", distinct=True),
        )
        status_filter = request.query_params.get("status")
        if status_filter:
            projects = projects.filter(status=status_filter)
        accessible_project_ids = set(project_queryset(request.user).values_list("pk", flat=True))
        serializer = ProjectDirectorySerializer(
            projects,
            many=True,
            context={"accessible_project_ids": accessible_project_ids},
        )
        return Response(serializer.data)

    def post(self, request):
        if not (is_admin(request.user) or is_department_manager(request.user)):
            return Response({"error": "Only department heads and administrators can create projects."}, status=status.HTTP_403_FORBIDDEN)
        department = (request.user.department or "").strip()
        if not department and not is_admin(request.user):
            return Response({"error": "Your department must be set before creating projects."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ProjectSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        leader = serializer.validated_data["leader"]
        department = department or str(request.data.get("department", "")).strip()
        if not department:
            return Response({"error": "A project department is required."}, status=status.HTTP_400_BAD_REQUEST)
        project = serializer.save(created_by=request.user, department=department)
        project_queryset(request.user)
        return Response(ProjectSerializer(project, context={"request": request}).data, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_visible_project(request.user, project_id)
        return Response(ProjectSerializer(project, context={"request": request}).data)

    def patch(self, request, project_id):
        project = get_visible_project(request.user, project_id)
        if not can_manage_project(request.user, project):
            return Response({"error": "You cannot manage this project."}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(ProjectSerializer(project, context={"request": request}).data)


class ProjectMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(is_active=True, is_archived=False)
        return Response(UserSummarySerializer(users.order_by("first_name", "last_name"), many=True).data)


class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.select_related("project", "assignee", "created_by").prefetch_related("comments__author", "attachments__uploaded_by").filter(project__in=project_queryset(request.user))
        for parameter, field in (("project", "project_id"), ("status", "status"), ("priority", "priority"), ("assignee", "assignee_id")):
            value = request.query_params.get(parameter)
            if value:
                tasks = tasks.filter(**{field: value})
        search = request.query_params.get("search", "").strip()
        if search:
            tasks = tasks.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(tags__icontains=search))
        return Response(TaskSerializer(tasks, many=True, context={"request": request}).data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        project = serializer.validated_data.get("project")
        if not project:
            return Response({"error": "project_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        visible_project = get_visible_project(request.user, project.id)
        if not can_manage_project(request.user, visible_project):
            return Response({"error": "Only the project leader or a department head can create tasks."}, status=status.HTTP_403_FORBIDDEN)
        assignee = serializer.validated_data.get("assignee")
        if assignee and assignee.pk not in set(visible_project.members.values_list("pk", flat=True)) | {visible_project.leader_id}:
            return Response({"error": "Tasks can only be assigned to project members or the project leader."}, status=status.HTTP_400_BAD_REQUEST)
        task = serializer.save(created_by=request.user)
        return Response(TaskSerializer(task, context={"request": request}).data, status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        task = get_visible_task(request.user, task_id)
        return Response(TaskSerializer(task, context={"request": request}).data)

    def patch(self, request, task_id):
        task = get_visible_task(request.user, task_id)
        manager = can_manage_project(request.user, task.project)
        if "project_id" in request.data:
            return Response({"error": "A task cannot be moved to another project."}, status=status.HTTP_400_BAD_REQUEST)
        if not manager:
            if task.assignee_id != request.user.id or set(request.data.keys()) != {"status"}:
                return Response({"error": "You can only update the status of tasks assigned to you."}, status=status.HTTP_403_FORBIDDEN)
        next_status = request.data.get("status")
        if next_status and next_status != task.status and next_status not in TASK_TRANSITIONS.get(task.status, set()):
            return Response({"error": f"A task cannot move from {task.status} to {next_status}."}, status=status.HTTP_400_BAD_REQUEST)
        if task.status == "Review" and next_status == "In Progress" and not manager:
            return Response({"error": "Only the project leader or department head can return a task from review."}, status=status.HTTP_403_FORBIDDEN)
        serializer = TaskSerializer(task, data=request.data, partial=True, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        assignee = serializer.validated_data.get("assignee", task.assignee)
        if assignee and assignee.pk not in set(task.project.members.values_list("pk", flat=True)) | {task.project.leader_id}:
            return Response({"error": "Tasks can only be assigned to project members or the project leader."}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(TaskSerializer(task, context={"request": request}).data)


class TaskCommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        task = get_visible_task(request.user, task_id)
        serializer = TaskCommentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        comment = serializer.save(task=task, author=request.user)
        return Response(TaskCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class TaskAttachmentsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, task_id):
        task = get_visible_task(request.user, task_id)
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "A file is required."}, status=status.HTTP_400_BAD_REQUEST)
        attachment = TaskAttachment.objects.create(task=task, uploaded_by=request.user, file=uploaded_file)
        return Response(TaskAttachmentSerializer(attachment, context={"request": request}).data, status=status.HTTP_201_CREATED)


class ProjectCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = project_queryset(request.user)
        plan_items = ImplementationPlanItem.objects.filter(project__in=projects).select_related("project")
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        if start:
            projects = projects.filter(Q(start_date__gte=start) | Q(end_date__gte=start) | Q(end_date__isnull=True, start_date__isnull=True))
            plan_items = plan_items.filter(Q(start_date__gte=start) | Q(end_date__gte=start) | Q(start_date__isnull=True, end_date__isnull=True))
        if end:
            projects = projects.filter(Q(start_date__lte=end) | Q(end_date__lte=end) | Q(end_date__isnull=True, start_date__isnull=True))
            plan_items = plan_items.filter(Q(start_date__lte=end) | Q(end_date__lte=end) | Q(start_date__isnull=True, end_date__isnull=True))
        events = []
        for project in projects:
            for kind, event_date in (("project_start", project.start_date), ("project_end", project.end_date)):
                if event_date:
                    events.append({"id": f"project-{project.id}-{kind}", "type": kind, "title": project.name, "date": event_date.isoformat(), "projectId": project.id})
        for item in plan_items:
            for kind, event_date in (("plan_start", item.start_date), ("plan_end", item.end_date)):
                if event_date:
                    events.append({"id": f"plan-{item.id}-{kind}", "type": kind, "title": item.item, "date": event_date.isoformat(), "projectId": item.project_id, "planItemId": item.id, "status": item.status})
        return Response(sorted(events, key=lambda event: (event["date"], event["title"].lower())))