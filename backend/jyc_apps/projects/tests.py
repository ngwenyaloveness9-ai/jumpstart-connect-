from rest_framework.test import APITestCase

from users.models import User
from .models import Project, Task


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