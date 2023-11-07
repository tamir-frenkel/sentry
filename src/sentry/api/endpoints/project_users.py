from rest_framework.request import Request
from rest_framework.response import Response

from sentry import analytics, eventstore
from sentry.api.api_publish_status import ApiPublishStatus
from sentry.api.base import region_silo_endpoint
from sentry.api.bases.project import ProjectEndpoint
from sentry.api.paginator import ChainPaginator
from sentry.api.serializers import serialize
from sentry.utils.eventuser import find_eventuser_with_snuba


@region_silo_endpoint
class ProjectUsersEndpoint(ProjectEndpoint):
    publish_status = {
        "GET": ApiPublishStatus.UNKNOWN,
    }

    def get(self, request: Request, project) -> Response:
        """
        List a Project's Users
        ``````````````````````

        Return a list of users seen within this project.

        :pparam string organization_slug: the slug of the organization.
        :pparam string project_slug: the slug of the project.
        :pparam string key: the tag key to look up.
        :auth: required
        :qparam string query: Limit results to users matching the given query.
                              Prefixes should be used to suggest the field to
                              match on: ``id``, ``email``, ``username``, ``ip``.
                              For example, ``query=email:foo@example.com``
        """
        analytics.record(
            "eventuser_endpoint.request",
            project_id=project.id,
            endpoint="sentry.api.endpoints.project_users.get",
        )
        # queryset = EventUser.objects.filter(project_id=project.id)
        conditions = []
        if request.GET.get("query"):
            try:
                field, identifier = request.GET["query"].strip().split(":", 1)
                # queryset = queryset.filter(
                #     project_id=project.id,
                #     **{EventUser.attr_from_keyword(field): identifier},
                # )
                conditions.append([field, "EQ", identifier])
            except (ValueError, KeyError):
                return Response([])
        snuba_filter = eventstore.Filter(project_ids=[project.id], conditions=conditions)
        events = eventstore.backend.get_events(
            filter=snuba_filter,
            orderby=["-timestamp", "-event_id"],
            tenant_ids={"organization_id": project.organization.id},
        )
        users = []
        for e in events:
            users.append(find_eventuser_with_snuba(e))

        return self.paginate(
            request=request,
            sources=[users],
            # order_by="-date_added",
            paginator_cls=ChainPaginator,
            on_results=lambda x: serialize(x, request.user),
        )
