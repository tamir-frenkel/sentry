import {useMemo} from 'react';
import {PlainRoute} from 'react-router';
import {useMatches} from 'react-router-dom';

import {USING_REACT_ROUTER_SIX} from 'sentry/constants';
import {useRouteContext} from 'sentry/utils/useRouteContext';

export function useRoutes() {
  if (!USING_REACT_ROUTER_SIX) {
    return useRouteContext().routes;
  }

  const matches = useMatches();

  // XXX(epurkhiser): This transforms react-router 6 style matches back to old
  // style react-router 3 rroute matches.
  //
  // TODO(epurkhiser): This likely still needs more work
  return useMemo(
    () => matches.map(match => ({path: match.pathname}) as PlainRoute),
    [matches]
  );
}
