import {useMemo} from 'react';
import {useLocation as useReactRouter6Location} from 'react-router-dom';
import type {Location, Query} from 'history';
import * as qs from 'query-string';

import {USING_REACT_ROUTER_SIX} from 'sentry/constants';
import {useRouteContext} from 'sentry/utils/useRouteContext';

type DefaultQuery<T = string> = {
  [key: string]: T | T[] | null | undefined;
};

export function useLocation<Q extends Query = DefaultQuery>(): Location<Q> {
  if (!USING_REACT_ROUTER_SIX) {
    return useRouteContext().location;
  }

  const {pathname, search, hash, state} = useReactRouter6Location();

  const query = useMemo(() => qs.parse(search), [search]);

  const location = useMemo(
    () => ({
      pathname: pathname,
      search: search,
      query,
      hash: hash,
      state: state,

      // TODO(epurkhiser): Some parts are not implemented
    }),
    [hash, pathname, query, search, state]
  );

  return location;
}
