import styled from '@emotion/styled';

import {getFormattedTimestamp} from 'sentry/components/events/interfaces/breadcrumbs/breadcrumb/time/utils';
import {Tooltip} from 'sentry/components/tooltip';
import {space} from 'sentry/styles/space';

export interface ItemProps {
  icon: React.ReactNode;
  timestamp: string;
  title: string;
  children?: React.ReactNode;
  color?: string;
  description?: string;
  rootTime?: string;
}

export function Item({title, children, icon, color = 'gray200', timestamp}: ItemProps) {
  const now = new Date();
  const {
    displayTime,
    date,
    timeWithMilliseconds: preciseTime,
  } = getFormattedTimestamp(timestamp, now.toTimeString());

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
      <Data>{children}</Data>
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
`;

const Line = styled('div')`
  grid-column: span 1;
  height: 100%;
  width: 0;
  justify-self: center;
  border-left: 1px solid ${p => p.theme.border};
`;

const Data = styled('div')`
  border-radius: ${space(0.5)};
  background: ${p => p.theme.backgroundSecondary};
  margin: 0 0 ${space(2)} -${space(0.75)};
  padding: ${space(0.75)};
  grid-column: span 2;
`;
