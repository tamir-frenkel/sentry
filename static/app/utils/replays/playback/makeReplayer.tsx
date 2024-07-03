import type {Theme} from '@emotion/react';
import type {eventWithTime, ReplayPlugin} from '@sentry-internal/rrweb';
import {Replayer, ReplayerEvents} from '@sentry-internal/rrweb';
import type {
  PlayerState,
  SpeedState,
} from '@sentry-internal/rrweb/typings/replay/machine';

import type {ReplayPrefs} from 'sentry/components/replays/preferences/replayPreferences';
import type {useReplayPlayerStateDispatch} from 'sentry/utils/replays/playback/providers/useReplayPlayerState';
import type {CustomEvent} from 'sentry/utils/replays/types';

type EventHandler = (event: unknown) => void;
type ResizeEventArg = {
  height: number;
  width: number;
};
type SkipEventArg = {
  speed: number;
};
type StateChangeEventArg = {player: PlayerState} | {speed: SpeedState};

interface Props {
  dispatch: ReturnType<typeof useReplayPlayerStateDispatch>;
  events: eventWithTime[];
  plugins: ReplayPlugin[];
  prefs: ReplayPrefs;
  root: HTMLElement;
  theme: Theme;
}

export default function makeReplayer({
  events,
  root,
  dispatch,
  theme,
  prefs,
  plugins,
}: Props): Replayer {
  console.log('makeReplayer', {events, root, dispatch, theme, prefs, plugins});
  const inst = new Replayer(events, {
    root,
    blockClass: 'sentry-block',
    mouseTail: {
      duration: 0.75 * 1000,
      lineCap: 'round',
      lineWidth: 2,
      strokeStyle: theme.purple200,
    },
    plugins,
    skipInactive: prefs.isSkippingInactive,
    speed: prefs.playbackSpeed,
  });

  inst.on(ReplayerEvents.Start, () => {
    dispatch({type: 'onStart'});
  });
  inst.on(ReplayerEvents.Pause, () => {
    dispatch({type: 'onPause'});
  });
  inst.on(ReplayerEvents.Resume, () => {
    dispatch({type: 'onResume'});
  });
  inst.on(ReplayerEvents.Resize, (({width, height}: ResizeEventArg) => {
    dispatch({type: 'onResize', width, height});
  }) as EventHandler);
  inst.on(ReplayerEvents.Finish, (() => {
    dispatch({type: 'onFinish'});
  }) as EventHandler);
  inst.on(ReplayerEvents.SkipStart, (({speed}: SkipEventArg) => {
    dispatch({type: 'onSkipStart', speed});
  }) as EventHandler);
  inst.on(ReplayerEvents.SkipEnd, (({speed}: SkipEventArg) => {
    dispatch({type: 'onSkipEnd', speed});
  }) as EventHandler);
  inst.on(ReplayerEvents.EventCast, ((event: eventWithTime) => {
    dispatch({type: 'onEventCast', event});
  }) as EventHandler);
  inst.on(ReplayerEvents.CustomEvent, ((event: CustomEvent) => {
    dispatch({type: 'onCustomEvent', event});
  }) as EventHandler);
  inst.on(ReplayerEvents.Flush, (() => {
    dispatch({type: 'onFlush'});
  }) as EventHandler);
  inst.on(ReplayerEvents.StateChange, ((event: StateChangeEventArg) => {
    if ('player' in event) {
      dispatch({type: 'onStateChange', player: event.player});
    }
    if ('speed' in event) {
      dispatch({type: 'onStateChange', speed: event.speed});
    }
  }) as EventHandler);
  inst.on(ReplayerEvents.PlayBack, (() => {
    dispatch({type: 'onPlayBack'});
  }) as EventHandler);
  inst.on(ReplayerEvents.Destroy, (() => {
    dispatch({type: 'onDestroy'});
  }) as EventHandler);

  return inst;
}
