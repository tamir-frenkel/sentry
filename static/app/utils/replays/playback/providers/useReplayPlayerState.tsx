import {createContext, type Dispatch, useContext, useReducer} from 'react';
import type {Timer} from '@sentry-internal/rrweb/typings/replay/timer';

import stateReducer from 'sentry/utils/replays/playback/stateReducer';
import type {Action, State} from 'sentry/utils/replays/playback/types';
import type {RecordingFrame} from 'sentry/utils/replays/types';

function createInitialState(): State {
  const timer = {timeOffset: 0, speed: 1} as Timer;
  return {
    dimensions: {width: 0, height: 0},
    player: {
      value: 'paused',
      context: {
        events: [] as RecordingFrame[],
        timer,
        timeOffset: 0,
        baselineTime: 0,
        lastPlayedEvent: null,
      },
    },
    speed: {
      value: 'normal',
      context: {
        normalSpeed: 1,
        timer,
      },
    },
  };
}

const StateContext = createContext<State>(createInitialState());
const DispatchContext = createContext<Dispatch<Action>>(() => {});

export function ReplayPlayerStateContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(stateReducer, null, createInitialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export default function useReplayPlayerState() {
  return useContext(StateContext);
}

export function useReplayPlayerStateDispatch() {
  return useContext(DispatchContext);
}
