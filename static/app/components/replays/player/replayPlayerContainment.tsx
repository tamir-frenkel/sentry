import type {CSSProperties, ReactNode} from 'react';
import {useRef} from 'react';
import {css} from '@emotion/react';

import {divide} from 'sentry/components/replays/utils';
import useReplayPlayerState from 'sentry/utils/replays/playback/providers/useReplayPlayerState';
import {useDimensions} from 'sentry/utils/useDimensions';

interface Props {
  /**
   * You must pass `styles` into the <ReplayPlayer>,
   */
  children: (styles: CSSProperties) => ReactNode;

  /**
   * How to measure and resize the player.
   *
   * "width"
   *   The default. Height available will not be measured. The replay will be
   *   resized to accomodate the width available, and the height grows to
   *   maintain the aspect-ratio. This can result in really tall replays when
   *   captured on a mobile device.
   *
   * "height"
   *
   * "both"
   *    Measure the player fully. Resize the player to fit within the given
   *    width & height. Useful if you want to reserve some space for the replay.
   *    ie: with a wrapper that has CSS `height` set.
   */
  measure?: 'both' | 'width' | 'height';
}

export default function ReplayPlayerContainment({children, measure = 'width'}: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const measuredDimensions = useDimensions({elementRef});
  const playerState = useReplayPlayerState();

  const parentDimensions = {
    width: measure === 'height' ? Number.MAX_SAFE_INTEGER : measuredDimensions.width,
    height: measure === 'width' ? Number.MAX_SAFE_INTEGER : measuredDimensions.height,
  };
  const childDimensions = playerState.dimensions;

  console.log('getContainment', {parentDimensions, childDimensions});

  const scale = Math.min(
    divide(parentDimensions.height, childDimensions.height),
    divide(parentDimensions.width, childDimensions.width),
    1.5
  );
  const scaleStyle = {transform: `scale(${scale})`};
  const dimensions = {
    width: childDimensions.width * scale,
    height: childDimensions.height * scale,
  };

  return (
    <div css={[commonCss, measurableElemCss]} ref={elementRef}>
      <div css={[commonCss, centeredContentCss]} style={dimensions}>
        {children(scaleStyle)}
      </div>
    </div>
  );
}

const commonCss = css`
  display: flex;
  flex-grow: 1;
  place-items: center;
  place-content: center;
  width: 100%;
`;
const measurableElemCss = css`
  height: 100%;
`;
const centeredContentCss = css`
  position: relative;
  overflow: hidden;
  overflow-x: auto;
`;
