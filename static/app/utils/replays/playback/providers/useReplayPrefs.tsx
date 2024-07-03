import {createContext, useContext, useMemo} from 'react';

import type {
  PrefsStrategy,
  ReplayPrefs,
} from 'sentry/components/replays/preferences/replayPreferences';
import {StaticReplayPreferences} from 'sentry/components/replays/preferences/replayPreferences';

const context = createContext<ReplayPrefs>(StaticReplayPreferences.get());

export function ReplayPreferencesContextProvider({
  children,
  prefsStrategy,
}: {
  children: React.ReactNode;
  prefsStrategy: PrefsStrategy;
}) {
  const prefs = prefsStrategy.get();
  const stringyPrefs = JSON.stringify(prefs);
  const memoizedPrefs = useMemo(() => prefs, [stringyPrefs]); // eslint-disable-line react-hooks/exhaustive-deps

  return <context.Provider value={memoizedPrefs}>{children}</context.Provider>;
}

export default function useReplayPrefs() {
  return useContext(context);
}
