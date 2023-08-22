import {useReplayContext} from 'sentry/components/replays/replayContext';
import useActiveReplayTab, {TabKey} from 'sentry/utils/replays/hooks/useActiveReplayTab';
import useOrganization from 'sentry/utils/useOrganization';
import AccessibilityList from 'sentry/views/replays/detail/accessibility';
import Console from 'sentry/views/replays/detail/console';
import DomMutations from 'sentry/views/replays/detail/domMutations';
import ErrorList from 'sentry/views/replays/detail/errorList/index';
import MemoryChart from 'sentry/views/replays/detail/memoryChart';
import NetworkList from 'sentry/views/replays/detail/network';
import PerfTable from 'sentry/views/replays/detail/perfTable/index';
import Trace from 'sentry/views/replays/detail/trace/index';

type Props = {};

function FocusArea({}: Props) {
  const {getActiveTab} = useActiveReplayTab();
  const {currentTime, currentHoverTime, replay, setCurrentTime, setCurrentHoverTime} =
    useReplayContext();
  const organization = useOrganization();

  switch (getActiveTab()) {
    case TabKey.NETWORK:
      return (
        <NetworkList
          isNetworkDetailsSetup={Boolean(replay?.isNetworkDetailsSetup())}
          networkFrames={replay?.getNetworkFrames()}
          projectId={replay?.getReplay()?.project_id}
          startTimestampMs={replay?.getReplay()?.started_at?.getTime() || 0}
        />
      );
    case TabKey.TRACE:
      return <Trace organization={organization} replayRecord={replay?.getReplay()} />;
    case TabKey.PERF:
      return <PerfTable />;
    case TabKey.ERRORS:
      return (
        <ErrorList
          errorFrames={replay?.getErrorFrames()}
          startTimestampMs={replay?.getReplay().started_at.getTime() ?? 0}
        />
      );
    case TabKey.DOM:
      return (
        <DomMutations
          replay={replay}
          startTimestampMs={replay?.getReplay()?.started_at?.getTime() || 0}
        />
      );
    case TabKey.A11Y:
      return (
        <AccessibilityList
          accessibilityFrames={[
            {
              element:
                '<img class="app-v0c8og empfevw2" style="width: 16px; height: 16px;">',
              id: 'image-alt',
              impact: 'critical',
              description:
                'Ensures <img> elements have alternate text or a role of none or presentation',
            },
          ]}
          accessibilityIssues={[
            {
              element:
                '<img class="app-v0c8og empfevw2" style="width: 16px; height: 16px;">',
              id: 'image-alt',
              impact: 'critical',
              description:
                'Ensures <img> elements have alternate text or a role of none or presentation',
            },
          ]}
          projectId={replay?.getReplay()?.project_id}
          startTimestampMs={replay?.getReplay()?.started_at?.getTime() || 0}

          // startTimestampMs={replay?.getReplay()?.started_at?.getTime() || 0}
        />
      );
    case TabKey.MEMORY:
      return (
        <MemoryChart
          currentTime={currentTime}
          currentHoverTime={currentHoverTime}
          memoryFrames={replay?.getMemoryFrames()}
          setCurrentTime={setCurrentTime}
          setCurrentHoverTime={setCurrentHoverTime}
          startTimestampMs={replay?.getReplay()?.started_at?.getTime()}
        />
      );
    case TabKey.CONSOLE:
    default: {
      return (
        <Console
          frames={replay?.getConsoleFrames()}
          startTimestampMs={replay?.getReplay().started_at.getTime() || 0}
        />
      );
    }
  }
}

export default FocusArea;
