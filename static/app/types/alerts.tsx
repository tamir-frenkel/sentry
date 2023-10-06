import type {SchemaFormConfig} from 'sentry/views/settings/organizationIntegrations/sentryAppExternalForm';

import type {IssueConfigField} from './integrations';

export const enum IssueAlertActionId {
  SLACK_NOTIFY_SERVICE_ACTION = 'sentry.integrations.slack.notify_action.SlackNotifyServiceAction',
  NOTIFY_EMAIL_ACTION = 'sentry.mail.actions.NotifyEmailAction',
}

export const enum IssueAlertConditionId {
  EVERY_EVENT_CONDITION = 'sentry.rules.conditions.every_event.EveryEventCondition',
  FIRST_SEEN_EVENT_CONDITION = 'sentry.rules.conditions.first_seen_event.FirstSeenEventCondition',
  REGRESSION_EVENT_CONDITION = 'sentry.rules.conditions.regression_event.RegressionEventCondition',
  REAPPEARED_EVENT_CONDITION = 'sentry.rules.conditions.reappeared_event.ReappearedEventCondition',
  EVENT_FREQUENCY_CONDITION = 'sentry.rules.conditions.event_frequency.EventFrequencyCondition',
  EVENT_UNIQUE_USER_FREQUENCY_CONDITION = 'sentry.rules.conditions.event_frequency.EventUniqueUserFrequencyCondition',
  EVENT_FREQUENCY_PERCENT_CONDITION = 'sentry.rules.conditions.event_frequency.EventFrequencyPercentCondition',
}

interface IssueAlertFormFieldChoice {
  type: 'choice';
  choices?: [string | number, string][];
  initial?: string;
  placeholder?: string;
}

interface IssueAlertFormFieldString {
  type: 'string';
  initial?: string;
  placeholder?: string;
}

interface IssueAlertFormFieldNumber {
  type: 'number';
  initial?: string;
  placeholder?: number | string;
}

type IssueAlertRuleFormField =
  | IssueAlertFormFieldChoice
  | IssueAlertFormFieldString
  | IssueAlertFormFieldNumber;

interface IssueAlertActionBase {
  id: IssueAlertActionId;
  /**
   * @deprecated No longer required but still provided by the api
   */
  name?: string;
}

export interface IssueAlertEmailAction extends IssueAlertActionBase {
  id: IssueAlertActionId.NOTIFY_EMAIL_ACTION;
  fallthroughType?: string;
  targetIdentifier?: unknown;
  targetType?: string;
}

interface IssueAlertSlackAction extends IssueAlertActionBase {
  channel: string;
  channel_id: string;
  id: IssueAlertActionId.SLACK_NOTIFY_SERVICE_ACTION;
  tags: string;
  /**
   * The workspace that the slack channel belongs to
   */
  workspace: string;
}

/**
 * When triggered an issue alert will fire a action
 */
export type IssueAlertAction = IssueAlertEmailAction | IssueAlertSlackAction;

interface IssueAlertConfigBase {
  enabled: boolean;
  id: string;
  label: string;
  /**
   * "Send a Slack notification"
   */
  prompt?: string;
}

interface IssueAlertGenericConfig extends IssueAlertConfigBase {
  id: IssueAlertActionId;
  formFields?: Record<string, IssueAlertRuleFormField>;
}

/**
 * The object describing the options the slack action can use.
 */
interface IssueAlertSlackConfig extends IssueAlertConfigBase {
  formFields: {
    channel: IssueAlertFormFieldString;
    channel_id: IssueAlertFormFieldString;
    tags: IssueAlertFormFieldString;
    workspace: IssueAlertFormFieldChoice;
  };
  id: IssueAlertActionId.SLACK_NOTIFY_SERVICE_ACTION;
}

interface IssueAlertTicketIntegrationConfig extends IssueAlertConfigBase {
  actionType: 'ticket';
  formFields: SchemaFormConfig;
  link: string;
  ticketType: string;
}

interface IssueAlertSentryAppIntegrationConfig extends IssueAlertConfigBase {
  actionType: 'sentryapp';
  formFields: SchemaFormConfig;
  sentryAppInstallationUuid: string;
}

interface IssueAlertGenericConditionConfig extends IssueAlertConfigBase {
  id: IssueAlertConditionId;
  formFields?: Record<string, IssueAlertRuleFormField>;
}

export type IssueAlertConfigurationAction =
  | IssueAlertGenericConfig
  | IssueAlertTicketIntegrationConfig
  | IssueAlertSentryAppIntegrationConfig
  | IssueAlertSlackConfig;

export type IssueAlertConfigurationCondition = IssueAlertGenericConditionConfig;

/**
 * Describes the actions, filters, and conditions that can be used
 * to create an issue alert.
 */
export interface IssueAlertConfigurationResponse {
  actions: IssueAlertConfigurationAction[];
  conditions: IssueAlertConfigurationCondition[];
  filters: any[];
}

/**
 * These templates that tell the UI how to render the action or condition
 * and what fields it needs
 */
export interface IssueAlertRuleActionTemplate {
  enabled: boolean;
  id: string;
  label: string;
  formFields?: Record<string, IssueAlertRuleFormField>;
  prompt?: string;
}
export type IssueAlertRuleConditionTemplate = IssueAlertRuleActionTemplate;

// /**
//  * These are the action or condition data that the user is editing or has saved.
//  */
// export interface IssueAlertRuleAction
//   extends Omit<IssueAlertRuleActionTemplate, 'formFields' | 'enabled'> {
//   // These are the same values as the keys in `formFields` for a template
//   [key: string]: any;
//   dynamic_form_fields?: IssueConfigField[];
// }

export type IssueAlertRuleCondition = Omit<
  IssueAlertRuleConditionTemplate,
  'formFields' | 'enabled'
> & {
  dynamic_form_fields?: IssueConfigField[];
} & {
  // These are the same values as the keys in `formFields` for a template
  [key: string]: number | string;
};

export interface UnsavedIssueAlertRule {
  /** When an issue matches [actionMatch] of the following */
  actionMatch: 'all' | 'any' | 'none';
  actions: IssueAlertAction[];
  conditions: IssueAlertRuleCondition[];
  /** If that issue has [filterMatch] of these properties */
  filterMatch: 'all' | 'any' | 'none';
  filters: IssueAlertRuleCondition[];
  frequency: number;
  name: string;
  environment?: null | string;
  owner?: string | null;
}

// Issue-based alert rule
export interface IssueAlertRule extends UnsavedIssueAlertRule {
  createdBy: {email: string; id: number; name: string} | null;
  dateCreated: string;
  id: string;
  projects: string[];
  snooze: boolean;
  status: 'active' | 'disabled';
  /**
   * Date alert is set to be disabled unless action is taken
   */
  disableDate?: string;
  disableReason?: 'noisy';
  errors?: {detail: string}[];
  lastTriggered?: string;
  /**
   * Set to true to opt out of the rule being automatically disabled
   * see also - status=disabled, disableDate, disableReason
   * TODO(scttcper): This is only used in the edit request and we should
   *  move it to its own interface
   */
  optOutEdit?: boolean;
  snoozeCreatedBy?: string;
  snoozeForEveryone?: boolean;
}

// Project's alert rule stats
export type ProjectAlertRuleStats = {
  count: number;
  date: string;
};

export enum MailActionTargetType {
  ISSUE_OWNERS = 'IssueOwners',
  TEAM = 'Team',
  MEMBER = 'Member',
  RELEASE_MEMBERS = 'ReleaseMembers',
}

export enum AssigneeTargetType {
  UNASSIGNED = 'Unassigned',
  TEAM = 'Team',
  MEMBER = 'Member',
}

export type NoteType = {
  mentions: string[];
  text: string;
};

/**
 * Used when determining what types of actions a rule has. The default action is "sentry.mail.actions.NotifyEmailAction"
 * while other actions can be integration (Slack, PagerDuty, etc) actions. We need to know this to determine what kind of muting
 * the alert should have.
 */
export enum RuleActionsCategories {
  ALL_DEFAULT = 'all_default',
  SOME_DEFAULT = 'some_default',
  NO_DEFAULT = 'no_default',
}
