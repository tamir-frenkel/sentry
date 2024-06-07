import {Component} from 'react';
import type {InjectedRouter} from 'react-router';
import {cache} from '@emotion/css'; // eslint-disable-line @emotion/no-vanilla
import {CacheProvider, ThemeProvider} from '@emotion/react';
import * as rtl from '@testing-library/react'; // eslint-disable-line no-restricted-imports
import userEvent from '@testing-library/user-event'; // eslint-disable-line no-restricted-imports

import {makeTestQueryClient} from 'sentry-test/queryClient';

import GlobalModal from 'sentry/components/globalModal';
import {SentryPropTypeValidators} from 'sentry/sentryPropTypeValidators';
import type {Organization} from 'sentry/types/organization';
import {QueryClientProvider} from 'sentry/utils/queryClient';
import {lightTheme} from 'sentry/utils/theme';
import {OrganizationContext} from 'sentry/views/organizationContext';
import {RouteContext} from 'sentry/views/routeContext';

import {instrumentUserEvent} from '../instrumentedEnv/userEventIntegration';

import {initializeOrg} from './initializeOrg';

interface ProviderOptions {
  /**
   * Sets the OrganizationContext. You may pass null to provide no organization
   */
  organization?: Partial<Organization> | null;
  /**
   * Sets the RouterContext
   */
  router?: Partial<InjectedRouter>;
}

interface Options extends ProviderOptions, rtl.RenderOptions {}

function makeAllTheProviders(providers: ProviderOptions) {
  const {organization, router} = initializeOrg({
    organization: providers.organization === null ? undefined : providers.organization,
    router: providers.router,
  });

  class LegacyRouterProvider extends Component<{children?: React.ReactNode}> {
    static childContextTypes = {
      router: SentryPropTypeValidators.isObject,
    };

    getChildContext() {
      return {router};
    }

    render() {
      return this.props.children;
    }
  }

  // In some cases we may want to not provide an organization at all
  const optionalOrganization = providers.organization === null ? null : organization;

  return function ({children}: {children?: React.ReactNode}) {
    return (
      <LegacyRouterProvider>
        <CacheProvider value={{...cache, compat: true}}>
          <ThemeProvider theme={lightTheme}>
            <QueryClientProvider client={makeTestQueryClient()}>
              <RouteContext.Provider
                value={{
                  router,
                  location: router.location,
                  params: router.params,
                  routes: router.routes,
                }}
              >
                <OrganizationContext.Provider value={optionalOrganization}>
                  {children}
                </OrganizationContext.Provider>
              </RouteContext.Provider>
            </QueryClientProvider>
          </ThemeProvider>
        </CacheProvider>
      </LegacyRouterProvider>
    );
  };
}

/**
 * Try avoiding unnecessary context and just mount your component. If it works,
 * then you dont need anything else.
 *
 * render(<TestedComponent />);
 *
 * If your component requires additional context you can pass it in the
 * options.
 */
function render(
  ui: React.ReactElement,
  {router, organization, ...rtlOptions}: Options = {}
) {
  const AllTheProviders = makeAllTheProviders({
    organization,
    router,
  });

  const renderResult = rtl.render(<AllTheProviders>{ui}</AllTheProviders>, rtlOptions);

  /**
   * Rerender the componeent.
   *
   * New context providers values may be passed in the options
   */
  function rerender(rerenderUi: React.ReactElement, providers?: ProviderOptions) {
    const ReRenderProvider =
      providers === undefined ||
      (providers?.organization === organization && providers?.router === router)
        ? AllTheProviders
        : makeAllTheProviders({
            organization,
            router,
          });

    return renderResult.rerender(<ReRenderProvider>{rerenderUi}</ReRenderProvider>);
  }

  return {...renderResult, rerender};
}

/**
 * @deprecated
 * Use userEvent over fireEvent where possible.
 * More details: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#not-using-testing-libraryuser-event
 */
const fireEvent = rtl.fireEvent;

function renderGlobalModal(options?: Options) {
  const result = render(<GlobalModal />, options);

  /**
   * Helper that waits for the modal to be removed from the DOM. You may need to
   * wait for the modal to be removed to avoid any act warnings.
   */
  function waitForModalToHide() {
    return rtl.waitFor(() => {
      expect(rtl.screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  }

  return {...result, waitForModalToHide};
}

/**
 * This cannot be implemented as a Sentry Integration because Jest creates an
 * isolated environment for each test suite. This means that if we were to apply
 * the monkey patching ahead of time, it would be shadowed by Jest.
 */
instrumentUserEvent();

// eslint-disable-next-line no-restricted-imports, import/export
export * from '@testing-library/react';

// eslint-disable-next-line import/export
export {render, renderGlobalModal, userEvent, fireEvent};
