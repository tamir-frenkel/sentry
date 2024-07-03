import {type HTMLAttributes, useEffect, useLayoutEffect, useRef} from 'react';
import {type Interpolation, type Theme, useTheme} from '@emotion/react';
import type {Replayer} from '@sentry-internal/rrweb';

import {
  baseReplayerCss,
  sentryReplayerCss,
} from 'sentry/components/replays/player/styles';
import {applyStateToReplayer} from 'sentry/utils/replays/playback/applyStateToReplayer';
import makeReplayer from 'sentry/utils/replays/playback/makeReplayer';
import useReplayPlayerEvents from 'sentry/utils/replays/playback/providers/useReplayPlayerEvents';
import useReplayPlayerPlugins from 'sentry/utils/replays/playback/providers/useReplayPlayerPlugins';
import useReplayPlayerState, {
  useReplayPlayerStateDispatch,
} from 'sentry/utils/replays/playback/providers/useReplayPlayerState';
import useReplayPrefs from 'sentry/utils/replays/playback/providers/useReplayPrefs';

function useReplayerInstance() {
  // The div that is emitted from react, where we will attach the replayer to
  const mountPointRef = useRef<HTMLDivElement>(null);

  // The Replayer instance itself, that is mounted into mountPointRef
  // Why?
  const replayerRef = useRef<Replayer | null>(null);

  // Collect the info Replayer depends on:
  const theme = useTheme();
  const prefs = useReplayPrefs();
  const getPlugins = useReplayPlayerPlugins();
  const events = useReplayPlayerEvents();

  // Hooks to sync this Replayer state up and out of this component
  const dispatch = useReplayPlayerStateDispatch();
  const playerState = useReplayPlayerState();

  // I think we need useLayoutEffect here to Replayer can find and mount the iframe inside
  // TODO: try `useEffect` instead
  useLayoutEffect(() => {
    const root = mountPointRef.current;
    if (root && !replayerRef.current) {
      const replayer = makeReplayer({
        events,
        dispatch,
        root,
        theme,
        prefs,
        plugins: getPlugins(events),
      });
      replayerRef.current = replayer;
      return () => {
        replayer.destroy();
        replayerRef.current = null;
      };
    }

    // eslint-disable-next-line no-console
    console.log('Unexpected!!: mountPointRef.current is unset inside <ReplayPlayer />');
    return () => {};
  }, [dispatch, events, getPlugins, prefs, theme]);

  useEffect(() => {
    if (replayerRef.current) {
      applyStateToReplayer(playerState, replayerRef.current);
    }
  }, [playerState]);

  return mountPointRef;
}

type Props = HTMLAttributes<HTMLDivElement> & {
  css?: Interpolation<Theme>;
};

export default function ReplayPlayer(props: Props) {
  console.log('ReplayPlayer', {props});
  const mountPointRef = useReplayerInstance();
  return (
    <div
      {...props}
      css={[baseReplayerCss, sentryReplayerCss, props.css]}
      ref={mountPointRef}
    />
  );
}
