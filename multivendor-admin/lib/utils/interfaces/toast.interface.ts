import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { TToastSeverity } from '../types';

export interface IToast {
  type: TToastSeverity;
  title: string;
  message: string;
  duration?: number;
  loading?: boolean;
}

export interface IToastNotificationComponentProps
  extends Omit<IToast, 'duration'> {}

interface ISeverityStyle {
  bgColor: string;
  textColor: string;
  icon: IconDefinition;
  iconBg: string;
}

export interface ISeverityStyles {
  success: ISeverityStyle;
  info: ISeverityStyle;
  error: ISeverityStyle;
  warn: ISeverityStyle;
}

export interface IToastContext {
  children?: React.ReactNode;
  showToast: (config: IToast) => void;
}

