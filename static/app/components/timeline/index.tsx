import {useMemo} from 'react';
import styled from '@emotion/styled';

import {getFormattedTimestamp} from 'sentry/components/events/interfaces/breadcrumbs/breadcrumb/time/utils';
import {Tooltip} from 'sentry/components/tooltip';
import {space} from 'sentry/styles/space';
import {defined} from 'sentry/utils';

export interface ItemProps {
  icon: React.ReactNode;
  timestamp: string;
  title: string;
  children?: React.ReactNode;
  color?: string;
  startTimestamp?: string;
}

export function Item({
  title,
  children,
  icon,
  color = 'gray200',
  timestamp,
  startTimestamp,
}: ItemProps) {
  const hasRelativeTime = defined(startTimestamp);
  const placeholderTime = useMemo(() => new Date().toTimeString(), []);

  const {
    displayTime,
    date,
    timeWithMilliseconds: preciseTime,
  } = hasRelativeTime
    ? getFormattedTimestamp(timestamp, startTimestamp, true)
    : getFormattedTimestamp(timestamp, placeholderTime);

  return (
    <Row>
      <IconWrapper color={color} isSelected={false}>
        {icon}
      </IconWrapper>
      <Title color={color}>{title}</Title>
      <Timestamp>
        <Tooltip title={`${preciseTime} - ${date}`}>{displayTime}</Tooltip>
      </Timestamp>
      <Line />
      <Content>{children}</Content>
    </Row>
  );
}

interface GroupProps {
  children: React.ReactNode;
}

export function Group({children}: GroupProps) {
  return <GroupWrapper>{children}</GroupWrapper>;
}

const GroupWrapper = styled('div')``;

const Row = styled('div')`
  color: ${p => p.theme.subText};
  display: grid;
  align-items: center;
  grid-template: auto auto / 22px 1fr auto;
  grid-column-gap: ${space(1)};
  &:last-child > :last-child {
    margin-bottom: 0;
  }
`;

const IconWrapper = styled('div')<{color: string; isSelected: boolean}>`
  grid-column: span 1;
  border-radius: 100%;
  border: 1px solid;
  border-color: ${p => (p.isSelected ? p.theme[p.color] : 'transparent')};
  color: ${p => p.theme[p.color]};
  svg {
    display: block;
    margin: ${space(0.5)};
  }
`;

const Title = styled('p')<{color: string}>`
  color: ${p => p.theme[p.color]};
  margin: 0;
  font-weight: bold;
  text-transform: capitalize;
  grid-column: span 1;
`;

const Timestamp = styled('p')`
  margin: 0;
  color: ${p => p.theme.subText};
  span {
    text-decoration: underline dashed ${p => p.theme.subText};
  }
`;

const Line = styled('div')`
  grid-column: span 1;
  height: 100%;
  width: 0;
  justify-self: center;
  border-left: 1px solid ${p => p.theme.border};
`;

const Content = styled('div')`
  margin: ${space(0.25)} 0 ${space(2)};
  grid-column: span 2;
  color: ${p => p.theme.subText};
`;

export const Text = styled('div')`
  &:only-child {
    margin-top: 0;
  }
`;

export const Data = styled('div')`
  border-radius: ${space(0.5)};
  padding: ${space(0.25)} ${space(0.75)};
  border: 1px solid ${p => p.theme.translucentInnerBorder};
  margin: ${space(0.75)} 0 0 -${space(0.75)};
  font-family: ${p => p.theme.text.familyMono};
  font-size: ${p => p.theme.fontSizeSmall};
  background: ${p => p.theme.backgroundSecondary};
  position: relative;
  &:only-child {
    margin-top: 0;
  }
`;
