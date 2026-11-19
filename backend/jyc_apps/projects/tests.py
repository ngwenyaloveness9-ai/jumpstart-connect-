from rest_framework.test import APITestCase

from users.models import User
from .models import ImplementationPlanItem, Project, Task


class ProjectWorkflowTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(
            email="manager@example.test",
            password="test-password",
            first_name="Department",
            last_name="Lead",
            department="Planning",
            role="manager",
            is_first_login=False,
            otp_verified=True,
        )
        self.member = User.objects.create_user(
            email="member@example.test",
            password="test-password",
            first_name="Project",
            last_name="Member",
            department="Planning",
            role="employee",
            is_first_login=False,
            otp_verified=True,
        )
        self.outsider = User.objects.create_user(
            email="outsider@example.test",
            password="test-password",
            first_name="Other",
            last_name="Department",
            department="Finance",
            role="employee",
            is_first_login=False,
            otp_verified=True,
        )
        self.project = Project.objects.create(
            name="Planning refresh",
            department="Planning",
            created_by=self.manager,
            leader=self.manager,
        )
        self.project.members.add(self.member)
        self.task = Task.objects.create(
            project=self.project,
            title="Prepare review",
            assignee=self.member,
            created_by=self.manager,
        )

    def test_project_visibility_is_limited_to_department_or_membership(self):
        self.client.force_authenticate(self.member)
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [self.project.id])

        self.client.force_authenticate(self.outsider)
        response = self.client.get(f"/api/project-tasks/{self.task.id}/")
        self.assertEqual(response.status_code, 404)

    def test_project_directory_lists_summaries_for_all_users(self):
        other_project = Project.objects.create(
            name="Finance upgrade",
            description="Replace the finance reporting system",
            department="Finance",
            status="On Hold",
            created_by=self.outsider,
            leader=self.outsider,
        )
        self.client.force_authenticate(self.member)
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, 200)
        summaries = {item["id"]: item for item in response.data}
        self.assertIn(other_project.id, summaries)
        self.assertEqual(summaries[other_project.id]["description"], "Replace the finance reporting system")
        self.assertEqual(summaries[other_project.id]["status"], "On Hold")
        self.assertFalse(summaries[other_project.id]["can_access"])

        self.client.force_authenticate(self.outsider)
        detail_response = self.client.get(f"/api/projects/{self.project.id}/")
        self.assertEqual(detail_response.status_code, 404)

    def test_task_status_follows_review_workflow(self):
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.patch(f"/api/project-tasks/{self.task.id}/", {"status": "Done"}).status_code, 400)
        self.assertEqual(self.client.patch(f"/api/project-tasks/{self.task.id}/", {"status": "In Progress"}).status_code, 200)
        self.assertEqual(self.client.patch(f"/api/project-tasks/{self.task.id}/", {"status": "Review"}).status_code, 200)
        self.assertEqual(self.client.patch(f"/api/project-tasks/{self.task.id}/", {"status": "In Progress"}).status_code, 403)

        self.client.force_authenticate(self.manager)
        response = self.client.patch(f"/api/project-tasks/{self.task.id}/", {"status": "In Progress"})
        self.assertEqual(response.status_code, 200)

    def test_task_cannot_be_moved_between_projects(self):
        self.client.force_authenticate(self.manager)
        other_project = Project.objects.create(
            name="Second project",
            department="Planning",
            created_by=self.manager,
            leader=self.manager,
        )
        response = self.client.patch(f"/api/project-tasks/{self.task.id}/", {"project_id": other_project.id})
        self.assertEqual(response.status_code, 400)

    def test_department_manager_can_create_project_and_assign_task(self):
        self.client.force_authenticate(self.manager)
        project_response = self.client.post("/api/projects/", {
            "name": "Quarterly planning",
            "description": "Planning department delivery work",
            "start_date": "2026-10-15",
            "end_date": "2026-12-15",
            "status": "Active",
            "leader_id": self.manager.id,
            "member_ids": [self.member.id],
        }, format="json")
        self.assertEqual(project_response.status_code, 201, project_response.data)

        task_response = self.client.post("/api/project-tasks/", {
            "project_id": project_response.data["id"],
            "title": "Prepare delivery schedule",
            "priority": "High",
            "assignee_id": self.member.id,
            "tags": ["planning", "october"],
        }, format="json")
        self.assertEqual(task_response.status_code, 201, task_response.data)
        self.assertEqual(task_response.data["assignee"]["id"], self.member.id)

    def test_manager_can_select_cross_department_leader_and_members(self):
        self.client.force_authenticate(self.manager)
        people_response = self.client.get("/api/projects/members/")
        self.assertEqual(people_response.status_code, 200)
        self.assertIn(self.outsider.id, [person["id"] for person in people_response.data])

        project_response = self.client.post("/api/projects/", {
            "name": "Cross-team initiative",
            "department": "Planning",
            "leader_id": self.outsider.id,
            "member_ids": [self.member.id, self.outsider.id],
        }, format="json")
        self.assertEqual(project_response.status_code, 201, project_response.data)
        self.assertEqual(project_response.data["leader"]["id"], self.outsider.id)
        self.assertEqual({member["id"] for member in project_response.data["members"]}, {self.member.id, self.outsider.id})

    def test_project_leader_can_manage_implementation_plan(self):
        self.client.force_authenticate(self.manager)
        create_response = self.client.post(f"/api/projects/{self.project.id}/implementation-plan/", {
            "item": "Install filtration unit",
            "description": "Install and test the pilot unit",
            "start_date": "2026-10-20",
            "end_date": "2026-10-25",
            "responsible_person_id": self.member.id,
            "status": "In Progress",
        }, format="json")
        self.assertEqual(create_response.status_code, 201, create_response.data)
        self.assertEqual(create_response.data["responsible_person"]["id"], self.member.id)

        row_id = create_response.data["id"]
        update_response = self.client.patch(f"/api/implementation-plan/{row_id}/", {"status": "Done"}, format="json")
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data["status"], "Done")

        calendar_response = self.client.get("/api/project-calendar/?start=2026-10-01&end=2026-10-31")
        self.assertEqual(calendar_response.status_code, 200)
        self.assertIn("plan_start", [event["type"] for event in calendar_response.data])
        self.assertIn("plan_end", [event["type"] for event in calendar_response.data])

    def test_implementation_plan_rejects_non_member_responsible_person_and_bad_dates(self):
        self.client.force_authenticate(self.manager)
        non_member_response = self.client.post(f"/api/projects/{self.project.id}/implementation-plan/", {
            "item": "Review budget",
            "responsible_person_id": self.outsider.id,
        }, format="json")
        self.assertEqual(non_member_response.status_code, 400)

        date_response = self.client.post(f"/api/projects/{self.project.id}/implementation-plan/", {
            "item": "Review budget",
            "start_date": "2026-10-25",
            "end_date": "2026-10-20",
        }, format="json")
        self.assertEqual(date_response.status_code, 400)

    def test_project_member_cannot_edit_implementation_plan(self):
        row = ImplementationPlanItem.objects.create(
            project=self.project,
            item="Prepare materials",
            created_by=self.manager,
        )
        self.client.force_authenticate(self.member)
        response = self.client.patch(f"/api/implementation-plan/{row.id}/", {"status": "Done"}, format="json")
        self.assertEqual(response.status_code, 403)