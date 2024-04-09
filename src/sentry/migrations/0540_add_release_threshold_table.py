# Generated by Django 3.2.20 on 2023-08-30 20:43

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models

import sentry.db.models.fields.bounded
import sentry.db.models.fields.foreignkey
from sentry.new_migrations.migrations import CheckedMigration


class Migration(CheckedMigration):
    # This flag is used to mark that a migration shouldn't be automatically run in production. For
    # the most part, this should only be used for operations where it's safe to run the migration
    # after your code has deployed. So this should not be used for most operations that alter the
    # schema of a table.
    # Here are some things that make sense to mark as post deployment:
    # - Large data migrations. Typically we want these to be run manually by ops so that they can
    #   be monitored and not block the deploy for a long period of time while they run.
    # - Adding indexes to large tables. Since this can take a long time, we'd generally prefer to
    #   have ops run this and not block the deploy. Note that while adding an index is a schema
    #   change, it's completely safe to run the operation after the code has deployed.
    is_post_deployment = False

    dependencies = [
        ("sentry", "0539_add_last_state_change_monitorenv"),
    ]

    operations = [
        migrations.CreateModel(
            name="ReleaseThreshold",
            fields=[
                (
                    "id",
                    sentry.db.models.fields.bounded.BoundedBigAutoField(
                        primary_key=True, serialize=False
                    ),
                ),
                ("threshold_type", sentry.db.models.fields.bounded.BoundedPositiveIntegerField()),
                ("trigger_type", sentry.db.models.fields.bounded.BoundedPositiveIntegerField()),
                ("value", models.IntegerField()),
                ("window_in_seconds", models.IntegerField()),
                ("date_added", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "environment",
                    sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="sentry.environment",
                    ),
                ),
                (
                    "project",
                    sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="sentry.project"
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
