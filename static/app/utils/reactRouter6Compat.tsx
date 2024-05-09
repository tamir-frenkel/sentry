import {Children, isValidElement} from 'react';
import {Outlet, RouteObject, useOutletContext} from 'react-router-dom';

import {useLocation} from './useLocation';
import {useParams} from './useParams';
import useRouter from './useRouter';

function isComponent(
  element: JSX.Element
): element is React.ReactElement<any, React.NamedExoticComponent<any>> {
  return typeof element.type !== 'string';
}

/**
 * Because some of our vies use cloneElement to inject route props into the
 * children views, we need to capture those props and pass them as outlet
 * context. The WithReactRouter3Props HoC component will inject the outlet
 * context into the view
 */
function OurOutlet(props: any) {
  return <Outlet context={props} />;
}

/**
 * HoC which injects params and a route object that emulate react-router3
 */
function withReactRouter3Props(Component: React.ComponentType<any>) {
  function WithReactRouter3Props() {
    const params = useParams();
    const router = useRouter();
    const location = useLocation();
    const outletContext = useOutletContext();

    return (
      <Component router={router} params={params} location={location} {...outletContext}>
        <OurOutlet />
      </Component>
    );
  }

  return WithReactRouter3Props;
}

function getElement(Component: React.ComponentType | undefined) {
  if (!Component) {
    return undefined;
  }

  const WrappedComponent = withReactRouter3Props(Component);

  return <WrappedComponent />;
}

/**
 * Transforms a react-router 3 style route tree into a valid react-router 6
 * router tree.
 *
 * TODO(epurkhiser): Things it must do:
 *
 *  - Transform the `component`
 *
 *
 */
export function buildReactRouter6Routes(tree: JSX.Element) {
  const routes: RouteObject[] = [];

  Children.forEach(tree, routeNode => {
    if (!isValidElement(routeNode)) {
      return;
    }
    if (!isComponent(routeNode)) {
      return;
    }

    const isRoute = routeNode.type.displayName === 'Route';
    const isIndexRoute = routeNode.type.displayName === 'IndexRoute';

    // Elements that are not Route components are likely fragments, just
    // traverse into their children in this case.
    if (!isRoute && !isIndexRoute) {
      routes.push(...buildReactRouter6Routes(routeNode.props.children));
      return;
    }

    const {path, component: Component, children} = routeNode.props;
    const element = getElement(Component);

    if (isIndexRoute) {
      routes.push({path, element, index: true});
    } else {
      routes.push({path, element, children: buildReactRouter6Routes(children)});
    }
  });

  return routes;
}
