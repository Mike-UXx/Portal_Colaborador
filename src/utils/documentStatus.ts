import type { Document, ViewRecord } from '../types';

/**
 * Display status drives BOTH the tag shown in the list and the ordering priority.
 *
 * Transitions:
 *  - "Aceite pendente"  → after acceptance becomes "Aceito"
 *  - "Informativo"      → after visualization becomes "Visualizado"
 */
export type DisplayStatus = 'pending' | 'informative' | 'visualizado' | 'accepted' | 'expired';

export function getDisplayStatus(doc: Document, viewRecords: ViewRecord[]): DisplayStatus {
  if (doc.status === 'pending') return 'pending';
  if (doc.status === 'accepted') return 'accepted';
  if (doc.status === 'expired') return 'expired';
  // informative: viewed → "Visualizado", otherwise "Informativo"
  const viewed = viewRecords.some(v => v.documentId === doc.id);
  return viewed ? 'visualizado' : 'informative';
}

/**
 * Listing priority (lower = higher in the list):
 *  1) Aceite pendente
 *  2) Informativo
 *  3) Aceito / Visualizado
 *  4) Expirado
 */
export const STATUS_PRIORITY: Record<DisplayStatus, number> = {
  pending: 0,
  informative: 1,
  accepted: 2,
  visualizado: 2,
  expired: 3,
};

/** Items still requiring the employee's attention (used by the Home "Documentos pendentes"). */
export function needsAttention(status: DisplayStatus): boolean {
  return status === 'pending' || status === 'informative';
}
