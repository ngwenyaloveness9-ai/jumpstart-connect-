from django.db import migrations


def seed_workspaces(apps, schema_editor):
    cursor = schema_editor.connection.cursor()

    # Ensure Main Workspace exists
    cursor.execute(
        'SELECT id FROM chat_group WHERE name=%s AND group_type=%s',
        ['Main Workspace', 'MAIN'],
    )
    if not cursor.fetchone():
        cursor.execute(
            'INSERT INTO chat_group (name, description, group_type, department, auto_add_members, created_at, updated_at, visibility) '
            'VALUES (%s, %s, %s, %s, %s, NOW(), NOW(), %s)',
            ['Main Workspace', 'Main Workspace', 'MAIN', None, True, 'PRIVATE'],
        )

    # Seed common departments
    names = [
        'System Admin',
        'Management',
        'Human Resources',
        'Monitoring & Evaluation',
        'Project Management',
        'Planning & Development',
        'Technology',
        'Marketing',
        'clean Energy',
        'Board Members',
    ]

    for name in names:
        cursor.execute(
            'SELECT id FROM chat_group WHERE name=%s AND group_type=%s',
            [name, 'DEPARTMENT'],
        )
        if not cursor.fetchone():
            cursor.execute(
                'INSERT INTO chat_group (name, description, group_type, department, auto_add_members, created_at, updated_at, visibility) '
                'VALUES (%s, %s, %s, %s, %s, NOW(), NOW(), %s)',
                [name, '', 'DEPARTMENT', name, False, 'PRIVATE'],
            )


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0007_group_auto_add_members_alter_group_group_type'),
    ]

    operations = [
        migrations.RunPython(seed_workspaces, reverse_code=migrations.RunPython.noop),
    ]
