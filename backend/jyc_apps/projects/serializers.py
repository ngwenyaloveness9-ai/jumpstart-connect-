from rest_framework import serializers

from users.models import User
from .models import ImplementationPlanItem, Project, Task, TaskAttachment, TaskComment


class UserSummarySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "first_name", "last_name", "email", "department", "role"]

    def get_name(self, user):
        return f"{user.first_name} {user.last_name}".strip() or user.email


class ProjectSerializer(serializers.ModelSerializer):
    leader = UserSummarySerializer(read_only=True)
    leader_id = serializers.PrimaryKeyRelatedField(source="leader", queryset=User.objects.filter(is_active=True), write_only=True)
    members = UserSummarySerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(source="members", queryset=User.objects.filter(is_active=True), many=True, write_only=True, required=False)
    created_by = UserSummarySerializer(read_only=True)
    task_count = serializers.IntegerField(read_only=True)
    completed_task_count = serializers.IntegerField(read_only=True)
    plan_item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "name", "description", "department", "start_date", "end_date", "status",
            "leader", "leader_id", "members", "member_ids", "created_by", "task_count",
            "completed_task_count", "plan_item_count", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "department", "created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date must be on or after the start date."})
        return attrs


class ProjectDirectorySerializer(serializers.ModelSerializer):
    leader = UserSummarySerializer(read_only=True)
    can_access = serializers.SerializerMethodField()
    plan_item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "name", "description", "department", "start_date", "end_date",
            "status", "leader", "plan_item_count", "can_access",
        ]

    def get_can_access(self, project):
        return project.pk in self.context["accessible_project_ids"]


class ImplementationPlanItemSerializer(serializers.ModelSerializer):
    responsible_person = UserSummarySerializer(read_only=True)
    responsible_person_id = serializers.PrimaryKeyRelatedField(
        source="responsible_person",
        queryset=User.objects.filter(is_active=True, is_archived=False),
        allow_null=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = ImplementationPlanItem
        fields = [
            "id", "project", "item", "description", "start_date", "end_date",
            "responsible_person", "responsible_person_id", "status", "created_by",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "project", "created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date must be on or after the start date."})
        return attrs


class TaskSerializer(serializers.ModelSerializer):
    project_id = serializers.PrimaryKeyRelatedField(source="project", queryset=Project.objects.all(), write_only=True, required=False)
    assignee = UserSummarySerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(source="assignee", queryset=User.objects.filter(is_active=True), write_only=True, allow_null=True, required=False)
    created_by = UserSummarySerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "project", "project_id", "title", "description", "assignee", "assignee_id",
            "created_by", "priority", "status", "start_date", "end_date", "tags", "comments",
            "attachments", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "project", "created_by", "created_at", "updated_at"]

    def get_comments(self, task):
        return TaskCommentSerializer(task.comments.select_related("author").all(), many=True).data

    def get_attachments(self, task):
        return TaskAttachmentSerializer(task.attachments.select_related("uploaded_by").all(), many=True, context=self.context).data

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date must be on or after the start date."})
        return attrs


class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = ["id", "author", "body", "created_at"]
        read_only_fields = ["id", "author", "created_at"]


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSummarySerializer(read_only=True)
    url = serializers.SerializerMethodField()

    class Meta:
        model = TaskAttachment
        fields = ["id", "uploaded_by", "file", "url", "uploaded_at"]
        read_only_fields = ["id", "uploaded_by", "url", "uploaded_at"]

    def get_url(self, attachment):
        request = self.context.get("request")
        return request.build_absolute_uri(attachment.file.url) if request else attachment.file.url