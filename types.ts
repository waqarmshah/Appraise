export enum AppMode {
  GP = 'GP',
  HOSPITAL = 'HOSPITAL'
}

export enum EntryType {
  AUTO = 'Auto-detect',
  CLINICAL = 'Clinical Case',
  REFLECTION = 'Reflection',
  DOPS = 'DOPs (Procedure)',
  MINI_CEX = 'Mini-CEX',
  CBD = 'CBD (Case Based Discussion)',
  ACAT = 'ACAT (Acute Take)',
  PDP = 'PDP (Goals)',
  OPCAT = 'OPCAT (Outpatient)',
  MCR = 'MCR (Feedback summary)',
  QI = 'QIP/Audit',
  SUMMARY = 'Activity Summary',
  CERTIFICATES = 'Certficates/Courses',
  COLLEGE_EXAM = 'College Exam',
  SIGNIFICANT_EVENT = 'Significant Event',
  COMPLAINT = 'Complaint/Compliment',
  FEEDBACK = 'Feedback',
}



export interface User {
  id: string; // Firebase UID
  email: string;
  name: string | null;
  photoURL: string | null;
  provider: 'google' | 'apple';
  plan: 'free' | 'appraise_plus';
  outputs_used_this_month: number;
  default_mode: 'gp' | 'hospital';
  custom_api_key?: string;
  created_at?: Date | { seconds: number; nanoseconds: number }; // Firestore Timestamp
  updated_at?: Date | { seconds: number; nanoseconds: number };
}

export interface Note {
  id: string;
  title: string;
  content: string; // HTML/Markdown content
  rawInput: string;
  dateCreated: string; // ISO string
  tags: string[];
  mode: AppMode;
  type: string;
}

export interface UsageStats {
  count: number;
  lastResetDate: string; // ISO date string YYYY-MM-DD
}