import {Fragment, useMemo} from 'react';
import styled from '@emotion/styled';
import beautify from 'js-beautify';

import {Flex} from 'sentry/components/container/flex';
import {CopyToClipboardButton} from 'sentry/components/copyToClipboardButton';
import SplitDiff from 'sentry/components/splitDiff';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import useExtractedPageHtml from 'sentry/utils/replays/hooks/useExtractedPageHtml';
import type ReplayReader from 'sentry/utils/replays/replayReader';

interface Props {
  leftOffsetMs: number;
  replay: null | ReplayReader;
  rightOffsetMs: number;
}

export function ReplayTextDiff({leftOffsetMs, replay, rightOffsetMs}: Props) {
  const {data} = useExtractedPageHtml({
    replay,
    offsetMsToStopAt: [leftOffsetMs, rightOffsetMs],
  });

  const [leftBody, rightBody] = useMemo(
    () => data?.map(([_, html]) => beautify.html(html, {indent_size: 2})) ?? [],
    [data]
  );

  return (
    <Fragment>
      <DiffHeader>
        <Flex flex="1" align="center">
          {t('Before Hydration')}
          <CopyToClipboardButton
            text={leftBody ?? ''}
            size="xs"
            iconSize="xs"
            borderless
            aria-label={t('Copy Before')}
          />
        </Flex>
        <Flex flex="1" align="center">
          {t('After Hydration')}
          <CopyToClipboardButton
            text={rightBody ?? ''}
            size="xs"
            iconSize="xs"
            borderless
            aria-label={t('Copy After')}
          />
        </Flex>
      </DiffHeader>
      <SplitDiffScrollWrapper>
        <SplitDiff base={leftBody ?? ''} target={rightBody ?? ''} type="words" />
      </SplitDiffScrollWrapper>
    </Fragment>
  );
}

const SplitDiffScrollWrapper = styled('div')`
  height: 65vh;
  overflow: auto;
`;

const DiffHeader = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  font-weight: ${p => p.theme.fontWeightBold};
  line-height: 1.2;

  div {
    height: 28px; /* div with and without buttons inside are the same height */
  }

  div:last-child {
    padding-left: ${space(2)};
  }
`;
