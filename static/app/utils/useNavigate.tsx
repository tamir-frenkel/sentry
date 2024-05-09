import {useCallback, useEffect, useRef} from 'react';
import {NavigateFunction, Path,useNavigate as useReactRouter6Navigate} from 'react-router-dom';

import {USING_REACT_ROUTER_SIX} from 'sentry/constants';
import {useRouteContext} from 'sentry/utils/useRouteContext';
import {normalizeUrl} from 'sentry/utils/withDomainRequired';

type NavigateOptions = {
  replace?: boolean;
  state?: any;
};

/**
 * Returns an imperative method for changing the location. Used by `<Link>`s, but
 * may also be used by other elements to change the location.
 *
 * @see https://reactrouter.com/hooks/use-navigate
 */
export function useNavigate() {
  if (USING_REACT_ROUTER_SIX) {
    return useReactRouter6Navigate();
  }

  const route = useRouteContext();

  const navigator = route.router;
  const hasMountedRef = useRef(false);
  useEffect(() => {
    hasMountedRef.current = true;
  });
  const navigate: NavigateFunction = useCallback(
    (to: string | number | Partial<Path>, options: NavigateOptions = {}) => {
      if (!hasMountedRef.current) {
        throw new Error(
          `You should call navigate() in a React.useEffect(), not when your component is first rendered.`
        );
      }
      if (typeof to === 'number') {
        return navigator.go(to);
      }

      const nextState = {
        pathname: normalizeUrl(to),
        state: options.state,
      };

      if (options.replace) {
        return navigator.replace(nextState as any);
      }

      return navigator.push(nextState as any);
    },
    [navigator]
  );
  return navigate;
}
