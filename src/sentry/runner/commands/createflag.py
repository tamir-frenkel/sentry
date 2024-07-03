import click

from flagpole import Feature, Segment
from flagpole.conditions import (
    ConditionBase,
    ConditionOperatorKind,
    ContainsCondition,
    EqualsCondition,
    InCondition,
    NotContainsCondition,
    NotEqualsCondition,
    NotInCondition,
)
from sentry.runner.decorators import configuration

valid_scopes = ["organization", "project"]
hardcoded_segment_properties = {
    "organization_id",
    "organization_slug",
    "organization_is-early-adopter",
    "project_id",
    "project_slug",
    "project_name",
    "user_id",
    "user_email",
}

feature_scopes_choices = click.Choice(valid_scopes)
condition_type_choices = click.Choice([op.value for op in ConditionOperatorKind])


def condition_wizard(display_sample_condition_properties: bool = False) -> ConditionBase:
    operator_kind = click.prompt("Operator type", type=condition_type_choices, show_choices=True)
    if display_sample_condition_properties:
        click.echo("Here are some example condition properties available:\n")
        for property_name in hardcoded_segment_properties:
            click.echo(f"{property_name}")
        click.echo("")

    property_name = click.prompt("Context property name", type=str)
    if operator_kind == ConditionOperatorKind.IN:
        return InCondition(value=[], property=property_name)
    elif operator_kind == ConditionOperatorKind.NOT_IN:
        return NotInCondition(value=[], property=property_name)
    elif operator_kind == ConditionOperatorKind.EQUALS:
        return EqualsCondition(value="", property=property_name)
    elif operator_kind == ConditionOperatorKind.NOT_EQUALS:
        return NotEqualsCondition(value="", property=property_name)
    elif operator_kind == ConditionOperatorKind.CONTAINS:
        return ContainsCondition(value="", property=property_name)
    elif operator_kind == ConditionOperatorKind.NOT_CONTAINS:
        return NotContainsCondition(value="", property=property_name)

    raise Exception("An unknown condition operator was provided")


def segment_wizard() -> list[Segment]:
    done_creating_segments = not click.confirm(
        "Would you like to create a new segment?", default=True
    )
    segments = []
    while not done_creating_segments:
        name = click.prompt("Name", type=str)
        rollout_percentage = click.prompt("Rollout percentage", type=int, default=100)
        conditions = []

        if should_create_conditions := click.confirm(
            "Would you like to create some conditions?", default=True
        ):
            should_display_options = True
            while should_create_conditions:
                condition = condition_wizard(
                    display_sample_condition_properties=should_display_options
                )
                should_display_options = False
                conditions.append(condition)
                should_create_conditions = click.confirm("Continue creating conditions?")

        segment = Segment(name=name, rollout=rollout_percentage, conditions=conditions)
        segments.append(segment)

        done_creating_segments = not click.confirm("Continue creating segments?", default=False)

    return segments


@click.command()
@click.option(
    "--blank", default=False, is_flag=True, help="If true, will create a blank flag config"
)
@click.option("--name", default=None, help="The name of the feature.")
@click.option(
    "--scope",
    default=None,
    help="The feature's scope. Must be either 'project' or 'organization'",
)
@click.option("--owner", default=None, help="The team name or email address of the feature owner.")
@configuration
def createflag(
    blank: bool | None,
    name: str | None,
    scope: str | None,
    owner: str | None,
) -> None:
    try:
        if not owner:
            entered_owner = click.prompt("Owner (team name or email address)", type=str)
            owner = entered_owner.strip()

        if not name:
            name = click.prompt("Feature name", type=str)

        assert name, "Feature must have a non-empty string as a name"
        name = name.strip().lower().replace(" ", "-")

        if not scope:
            scope = click.prompt(
                "Feature scope",
                type=feature_scopes_choices,
                default="organization",
                show_choices=True,
            )

        assert scope, "A feature scope must be provided"
        scope = scope.lower().strip()
        if scope not in valid_scopes:
            raise click.ClickException(
                f"Scope must be either 'organization' or 'project', received '{scope}'"
            )

        segments = []

        if not blank:
            segments = segment_wizard()
        feature = Feature(name=f"feature.{scope}:{name}", owner=owner, segments=segments)
    except Exception as err:
        raise click.ClickException(f"{err}")

    click.echo("")
    click.echo("=== GENERATED YAML ===\n")
    click.echo(feature.to_yaml_str())
