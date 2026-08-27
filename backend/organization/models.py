from django.db import models
from django.conf import settings


class LeaveRequest(models.Model):
	STATUS_CHOICES = (
		("Pending", "Pending"),
		("Approved", "Approved"),
		("Declined", "Declined"),
	)

	employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leave_requests")
	department = models.CharField(max_length=100)
	leave_type = models.CharField(max_length=100)
	start_date = models.DateField()
	end_date = models.DateField()
	days = models.PositiveIntegerField()
	reason = models.TextField()
	attachment = models.FileField(upload_to="leave_attachments/", null=True, blank=True)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
	decline_reason = models.TextField(blank=True, default="")
	approval_stage = models.CharField(max_length=20, default="head")
	stage_changed_at = models.DateTimeField(auto_now_add=True)
	submitted_at = models.DateTimeField(auto_now_add=True)
	reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_leave_requests")
	reviewed_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ["-submitted_at"]


class Notification(models.Model):
	NOTIFICATION_TYPES = (
		("leave_approved", "Leave Approved"),
		("leave_declined", "Leave Declined"),
		("leave_escalated", "Leave Escalated"),
	)

	recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
	title = models.CharField(max_length=255)
	message = models.TextField()
	notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
	related_object_id = models.PositiveIntegerField(null=True, blank=True)
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-created_at"]
