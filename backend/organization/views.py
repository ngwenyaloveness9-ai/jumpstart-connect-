from datetime import timedelta
from django.utils import timezone
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import LeaveRequest, Notification
from users.models import User

REVIEW_ROLES = {"manager", "department manager", "head of department", "supervisor", "head of technology"}


def role_of(user):
	return (user.role or "").strip().lower()


def is_hr(user):
	return role_of(user) in {"hr", "human resources", "hr manager", "hr officer"}


def is_campus_manager(user):
	return role_of(user) in {"campus manager", "campus director"}


def create_notification(recipient, title, message, notification_type, related_object_id=None):
	Notification.objects.create(
		recipient=recipient,
		title=title,
		message=message,
		notification_type=notification_type,
		related_object_id=related_object_id,
	)


def notify_hr_users(title, message, related_object_id=None):
	for hr_user in User.objects.filter(is_active=True):
		if is_hr(hr_user):
			create_notification(hr_user, title, message, "leave_approved" if "approved" in title.lower() else "leave_declined" if "declined" in title.lower() else "leave_escalated", related_object_id)


def advance_overdue_stage(item):
	if item.status != "Pending" or timezone.now() - item.stage_changed_at < timedelta(days=2):
		return item
	if item.approval_stage == "head":
		item.approval_stage = "hr"
	elif item.approval_stage == "campus":
		item.approval_stage = "hr"
	else:
		return item
	item.stage_changed_at = timezone.now()
	item.save(update_fields=["approval_stage", "stage_changed_at"])
	notify_hr_users(
		f"Leave request escalated to HR",
		f"A leave request from {item.employee.first_name} {item.employee.last_name} has been escalated to HR due to no response within 2 days.",
		item.id,
	)
	return item


def serialize_leave(leave_request, http_request=None):
	return {
		"id": str(leave_request.id),
		"employeeId": leave_request.employee_id,
		"employee": f"{leave_request.employee.first_name} {leave_request.employee.last_name}".strip() or leave_request.employee.email,
		"department": leave_request.department,
		"type": leave_request.leave_type,
		"startDate": leave_request.start_date.isoformat(),
		"endDate": leave_request.end_date.isoformat(),
		"days": leave_request.days,
		"reason": leave_request.reason,
		"attachment": http_request.build_absolute_uri(leave_request.attachment.url) if http_request and leave_request.attachment else (leave_request.attachment.url if leave_request.attachment else None),
		"declineReason": leave_request.decline_reason,
		"status": leave_request.status,
		"approvalStage": leave_request.approval_stage,
		"stageChangedAt": leave_request.stage_changed_at.isoformat(),
		"submittedAt": leave_request.submitted_at.isoformat(),
		"reviewedBy": leave_request.reviewed_by_id,
		"reviewedAt": leave_request.reviewed_at.isoformat() if leave_request.reviewed_at else None,
	}


class LeaveRequestListView(APIView):
	permission_classes = [IsAuthenticated]
	parser_classes = [MultiPartParser, FormParser]

	def get(self, request):
		role = role_of(request.user)
		for item in LeaveRequest.objects.filter(status="Pending"):
			advance_overdue_stage(item)
		requests = LeaveRequest.objects.select_related("employee", "reviewed_by")
		if is_hr(request.user) or role in ["superadmin", "admin", "administrator"]:
			pass
		elif is_campus_manager(request.user):
			requests = requests.filter(Q(approval_stage="campus") | Q(employee=request.user))
		elif role in REVIEW_ROLES:
			requests = requests.filter(Q(approval_stage="head", department__iexact=request.user.department or "") | Q(employee=request.user))
		else:
			requests = requests.filter(employee=request.user)
		return Response([serialize_leave(item, request) for item in requests])

	def post(self, request):
		required = ["type", "startDate", "endDate", "reason"]
		if any(not request.data.get(field) for field in required):
			return Response({"error": "Leave type, dates, and reason are required."}, status=400)
		start_date = request.data["startDate"]
		end_date = request.data["endDate"]
		from datetime import date
		try:
			start = date.fromisoformat(start_date)
			end = date.fromisoformat(end_date)
		except ValueError:
			return Response({"error": "Invalid leave dates."}, status=400)
		days = (end - start).days + 1
		if days < 1:
			return Response({"error": "End date must be on or after start date."}, status=400)
		department = request.user.department or ""
		if not department:
			return Response({"error": "Your department is missing."}, status=400)
		initial_stage = "campus" if role_of(request.user) in REVIEW_ROLES else "head"
		attachment = request.FILES.get("attachment")
		if request.data["type"] in ["Study Leave", "Sick Leave"] and not attachment:
			return Response({"error": "A supporting document is required for Study Leave and Sick Leave."}, status=400)
		item = LeaveRequest.objects.create(employee=request.user, department=department, leave_type=request.data["type"], start_date=start, end_date=end, days=days, reason=request.data["reason"].strip(), attachment=attachment, approval_stage=initial_stage)
		return Response(serialize_leave(item, request), status=201)


class LeaveRequestDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def patch(self, request, pk):
		try:
			item = LeaveRequest.objects.select_related("employee").get(pk=pk)
		except LeaveRequest.DoesNotExist:
			return Response({"error": "Leave request not found."}, status=404)
		item = advance_overdue_stage(item)
		role = role_of(request.user)
		is_department_reviewer = role in REVIEW_ROLES and item.approval_stage == "head" and item.department.lower() == (request.user.department or "").lower()
		is_hr_reviewer = is_hr(request.user) and item.approval_stage == "hr"
		is_campus_reviewer = is_campus_manager(request.user) and item.approval_stage == "campus"
		if not (is_department_reviewer or is_hr_reviewer or is_campus_reviewer or role in ["superadmin", "admin", "administrator"]):
			return Response({"error": "You cannot review this leave request."}, status=403)
		new_status = request.data.get("status")
		if new_status not in ["Approved", "Declined"]:
			return Response({"error": "Status must be Approved or Declined."}, status=400)
		decline_reason = str(request.data.get("declineReason", "")).strip()
		if new_status == "Declined" and not decline_reason:
			return Response({"error": "A reason is required when declining a leave request."}, status=400)
		item.status = new_status
		item.decline_reason = decline_reason if new_status == "Declined" else ""
		item.reviewed_by = request.user
		item.reviewed_at = timezone.now()
		item.save(update_fields=["status", "decline_reason", "reviewed_by", "reviewed_at"])

		if new_status == "Approved":
			create_notification(
				item.employee,
				"Leave request approved",
				f"Your leave request from {item.start_date} to {item.end_date} has been approved by {request.user.first_name} {request.user.last_name}.",
				"leave_approved",
				item.id,
			)
		else:
			create_notification(
				item.employee,
				"Leave request declined",
				f"Your leave request from {item.start_date} to {item.end_date} has been declined. Reason: {decline_reason}",
				"leave_declined",
				item.id,
			)

		notify_hr_users(
			f"Leave request {new_status.lower()}",
			f"A leave request from {item.employee.first_name} {item.employee.last_name} ({item.department}) has been {new_status.lower()} by {request.user.first_name} {request.user.last_name}.",
			item.id,
		)

		return Response(serialize_leave(item, request))


class NotificationListView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		notifications = Notification.objects.filter(recipient=request.user).order_by("-created_at")[:50]
		data = []
		for n in notifications:
			data.append({
				"id": n.id,
				"title": n.title,
				"message": n.message,
				"notificationType": n.notification_type,
				"relatedObjectId": n.related_object_id,
				"isRead": n.is_read,
				"createdAt": n.created_at.isoformat(),
			})
		return Response({"notifications": data, "unreadCount": Notification.objects.filter(recipient=request.user, is_read=False).count()})

	def patch(self, request):
		notification_id = request.data.get("notificationId")
		if not notification_id:
			return Response({"error": "notificationId is required."}, status=400)
		try:
			notification = Notification.objects.get(id=notification_id, recipient=request.user)
		except Notification.DoesNotExist:
			return Response({"error": "Notification not found."}, status=404)
		notification.is_read = True
		notification.save(update_fields=["is_read"])
		return Response({"status": "read"})
