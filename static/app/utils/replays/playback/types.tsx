import type {
  PlayerState,
  SpeedState,
} from '@sentry-internal/rrweb/typings/replay/machine';

import type {CustomEvent, Dimensions, RecordingFrame} from 'sentry/utils/replays/types';

export type Action =
  | {type: 'onStart'}
  | {type: 'onPause'}
  | {type: 'onResume'}
  | {height: number; type: 'onResize'; width: number}
  | {type: 'onFinish'}
  | {speed: number; type: 'onSkipStart'}
  | {speed: number; type: 'onSkipEnd'}
  | {event: RecordingFrame; type: 'onEventCast'}
  | {event: CustomEvent; type: 'onCustomEvent'}
  | {type: 'onFlush'}
  | {player: PlayerState; type: 'onStateChange'}
  | {speed: SpeedState; type: 'onStateChange'}
  | {type: 'onPlayBack'}
  | {type: 'onDestroy'};

export interface State {
  dimensions: Dimensions;
  player: PlayerState;
  speed: SpeedState;
}
