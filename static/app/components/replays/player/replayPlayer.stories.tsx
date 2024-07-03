import NegativeSpaceContainer from 'sentry/components/container/negativeSpaceContainer';
import ReplayPlayer from 'sentry/components/replays/player/replayPlayer';
import ReplayPlayerContainment from 'sentry/components/replays/player/replayPlayerContainment';
import {StaticReplayPreferences} from 'sentry/components/replays/preferences/replayPreferences';
import storyBook from 'sentry/stories/storyBook';
import useReplayReader from 'sentry/utils/replays/hooks/useReplayReader';
import {ReplayPlayerEventsContextProvider} from 'sentry/utils/replays/playback/providers/useReplayPlayerEvents';
import {ReplayPlayerPluginsContextProvider} from 'sentry/utils/replays/playback/providers/useReplayPlayerPlugins';
import {ReplayPlayerStateContextProvider} from 'sentry/utils/replays/playback/providers/useReplayPlayerState';
import {ReplayPreferencesContextProvider} from 'sentry/utils/replays/playback/providers/useReplayPrefs';
import useOrganization from 'sentry/utils/useOrganization';

function Providers({children, replay}) {
  return (
    <ReplayPreferencesContextProvider prefsStrategy={StaticReplayPreferences}>
      <ReplayPlayerPluginsContextProvider>
        <ReplayPlayerEventsContextProvider replay={replay}>
          <ReplayPlayerStateContextProvider>{children}</ReplayPlayerStateContextProvider>
        </ReplayPlayerEventsContextProvider>
      </ReplayPlayerPluginsContextProvider>
    </ReplayPreferencesContextProvider>
  );
}

export default storyBook(ReplayPlayer, story => {
  story('measure=width, default', () => {
    const organization = useOrganization();
    const {replay, fetching} = useReplayReader({
      orgSlug: organization.slug,
      replaySlug: 'ac78f5140bc148b3a34692b97768e28d',
    });

    if (!replay || fetching) {
      return 'Loading...';
    }
    console.log('Loaded!', {replay});

    return (
      <Providers replay={replay}>
        <ReplayPlayerContainment measure="width">
          {style => <ReplayPlayer style={style} />}
        </ReplayPlayerContainment>
      </Providers>
    );
  });

  story('measure=height, with a wrapper that reserves width', () => {
    const organization = useOrganization();
    const {replay, fetching} = useReplayReader({
      orgSlug: organization.slug,
      replaySlug: 'ac78f5140bc148b3a34692b97768e28d',
    });

    if (!replay || fetching) {
      return 'Loading...';
    }
    console.log('Loaded!', {replay});

    return (
      <Providers replay={replay}>
        <NegativeSpaceContainer style={{width: 700}}>
          <ReplayPlayerContainment measure="height">
            {style => <ReplayPlayer style={style} />}
          </ReplayPlayerContainment>
        </NegativeSpaceContainer>
      </Providers>
    );
  });

  story('measure=both, with a wrapper that reserves height', () => {
    const organization = useOrganization();
    const {replay, fetching} = useReplayReader({
      orgSlug: organization.slug,
      replaySlug: 'ac78f5140bc148b3a34692b97768e28d',
    });

    if (!replay || fetching) {
      return 'Loading...';
    }
    console.log('Loaded!', {replay});

    return (
      <Providers replay={replay}>
        <NegativeSpaceContainer style={{height: 500}}>
          <ReplayPlayerContainment measure="both">
            {style => <ReplayPlayer style={style} />}
          </ReplayPlayerContainment>
        </NegativeSpaceContainer>
      </Providers>
    );
  });
});
