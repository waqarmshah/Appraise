export enum AppMode {
  GP = 'GP',
  HOSPITAL = 'HOSPITAL'
}

export enum EntryType {
  AUTO = 'Auto-detect',
  CLINICAL = 'Clinical Case',
  CPD = 'CPD / Teaching',
  QI = 'QI / Audit',
  SIGNIFICANT_EVENT = 'Significant Event',
  COMPLAINT_COMPLIMENT = 'Complaint / Compliment',
  FEEDBACK = 'Feedback',
  PDP = 'PDP Idea'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'plus';
}

export interface Note {
  id: string;
  title: string;
  content: string; // HTML/Markdown content
  rawInput: string;
  dateCreated: string; // ISO string
  tags: string[];
  mode: AppMode;
  type: EntryType;
}

export interface UsageStats {
  count: number;
  lastResetDate: string; // ISO date string YYYY-MM-DD
}