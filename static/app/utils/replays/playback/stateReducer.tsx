import type {Action, State} from 'sentry/utils/replays/playback/types';

export default function stateReducer(state: State, action: Action): State {
  console.log('reducing', {state, action});
  switch (action.type) {
    case 'onStart':
      return state;
    case 'onPause':
      return state;
    case 'onResume':
      return state;
    case 'onResize':
      if (
        state.dimensions.width !== action.width ||
        state.dimensions.height !== action.height
      ) {
        return {
          ...state,
          dimensions: {
            width: action.width,
            height: action.height,
          },
        };
      }
      return state;
    case 'onFinish':
      return state;
    case 'onSkipStart':
      return state;
    case 'onSkipEnd':
      return state;
    case 'onEventCast':
      return state;
    case 'onCustomEvent':
      return state;
    case 'onFlush':
      return state;
    case 'onStateChange':
      return state;
    case 'onPlayBack':
      return state;
    case 'onDestroy':
      return state;
    default:
      // @ts-expect-error: Unreachable code: the switch should be exhaustive and cover all possible values.
      throw Error('Unknown action: ' + action.type);
  }
}
