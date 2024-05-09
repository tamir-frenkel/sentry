import {useMemo} from 'react';
import {InjectedRouter} from 'react-router';

import {USING_REACT_ROUTER_SIX} from 'sentry/constants';
import {useRouteContext} from 'sentry/utils/useRouteContext';

import {useLocation} from './useLocation';
import {useNavigate} from './useNavigate';
import {useParams} from './useParams';
import {useRoutes} from './useRoutes';

function useRouter() {
  if (!USING_REACT_ROUTER_SIX) {
    return useRouteContext().router;
  }

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const routes = useRoutes();

  // XXX(epurkhiser): We emulate the react-router 3 `router` interface here
  const router: InjectedRouter = useMemo(
    () => ({
      go: delta => navigate(delta),
      push: path => navigate(path),
      replace: path => navigate(path, {replace: true}),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
      location,
      params,
      routes,
    }),
    [location, navigate, params, routes]
  );

  return router;
}

export default useRouter;
