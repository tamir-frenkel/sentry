import type {Replayer} from '@sentry-internal/rrweb';

import type {State} from 'sentry/utils/replays/playback/types';

export function applyStateToReplayer(state: State, replayer: Replayer) {
  console.log('applyStateToReplayer', {state, replayer});
}
