export type DocumentStatus = 'pending' | 'accepted' | 'informative' | 'expired';

export type ReadLockType = 'scroll' | 'timer' | 'both' | 'none';

export interface Document {
  id: string;
  title: string;
  version: string;
  category: string;
  department: string[];
  status: DocumentStatus;
  createdAt: string;
  expiresAt?: string;
  pdfUrl: string;
  requireScrollComplete: boolean;
  readingTimerSeconds?: number;
  hash: string;
  isNew: boolean;
  description: string;
  readLock: ReadLockType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  cpf: string;
  role: string;
  avatarInitials: string;
  firstAccess: boolean;
}

export interface Evidence {
  ip: string;
  timestamp: string;
  userAgent: string;
  documentHash: string;
  geolocation?: string;
}

export interface AcceptanceRecord {
  id: string;
  documentId: string;
  documentTitle: string;
  documentVersion: string;
  userId: string;
  userName: string;
  userCpf: string;
  evidence: Evidence;
  certificateGenerated: boolean;
  // immutable append-only log
  readonly createdAt: string;
}

export interface ViewRecord {
  documentId: string;
  userId: string;
  /** Last visualization timestamp (ISO) */
  viewedAt: string;
}

export interface Survey {
  id: string;
  title: string;
  deadline: string; // ISO — "Prazo"
  status: 'pending' | 'answered';
  estimatedMinutes: number;
}

export interface Training {
  id: string;
  title: string;
  deadline: string; // ISO — "Prazo"
  status: 'pending' | 'completed';
  durationMinutes: number;
}

export interface FilterState {
  status: DocumentStatus | 'all';
  search: string;
  sortBy: 'date' | 'alpha';
  sortOrder: 'asc' | 'desc';
}

export interface ReadingState {
  scrollComplete: boolean;
  timerComplete: boolean;
  timerSecondsLeft: number;
  currentPage: number;
  totalPages: number;
  scrollProgress: number;
}
