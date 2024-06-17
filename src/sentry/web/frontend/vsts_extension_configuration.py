import re

from django.core.exceptions import BadRequest

from sentry.web.frontend.base import control_silo_view

from .integration_extension_configuration import IntegrationExtensionConfigurationView


@control_silo_view
class VstsExtensionConfigurationView(IntegrationExtensionConfigurationView):
    provider = "vsts"
    external_provider_key = "vsts-extension"

    def __is_validate_account_name(self, account_name: str) -> bool:
        """Validates the Azure DevOps account name

        https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/rename-organization?view=azure-devops#rename-your-organization

        > Adhere to the following guidelines when you create an organization name.
        >
        > Use only letters from the English alphabet
        > Start your organization name with a letter or number
        > Use letters, numbers, or hyphens after the initial character
        > Ensure that your organization doesn't exceed 50 Unicode characters
        > End with a letter or number
        """
        pattern = r"^[A-Za-z0-9][A-Za-z0-9-]{0,48}[A-Za-z0-9]$"

        return bool(re.match(pattern, account_name))

    def map_params_to_state(self, params):
        if not self.__is_validate_account_name(account_name=params["targetName"]):
            raise BadRequest("invalid targetName")

        return {"accountId": params["targetId"], "accountName": params["targetName"]}
