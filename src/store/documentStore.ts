import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Document, AcceptanceRecord, FilterState, ViewRecord } from '../types';
import { MOCK_DOCUMENTS, MOCK_ACCEPTANCE_RECORDS, MOCK_VIEW_RECORDS } from '../mocks/data';
import { freezeRecord } from '../utils/hash';
import { getDisplayStatus, STATUS_PRIORITY } from '../utils/documentStatus';
import dayjs from 'dayjs';

interface DocumentState {
  documents: Document[];
  acceptanceRecords: AcceptanceRecord[];
  viewRecords: ViewRecord[];
  filters: FilterState;

  // Selectors
  getDocumentById: (id: string) => Document | undefined;
  getPendingDocuments: () => Document[];
  getNewDocuments: () => Document[];
  getFilteredDocuments: () => Document[];
  getAcceptanceRecord: (documentId: string, userId: string) => AcceptanceRecord | undefined;
  getViewRecord: (documentId: string, userId: string) => ViewRecord | undefined;

  // Actions
  setFilter: (patch: Partial<FilterState>) => void;
  recordAcceptance: (record: AcceptanceRecord) => void;
  markDocumentAccepted: (documentId: string) => void;
  recordView: (documentId: string, userId: string) => void;

  // Onboarding: link active department docs to the user
  linkDepartmentDocuments: (department: string) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: MOCK_DOCUMENTS,
      acceptanceRecords: MOCK_ACCEPTANCE_RECORDS,
      viewRecords: MOCK_VIEW_RECORDS,
      filters: {
        status: 'all',
        search: '',
        sortBy: 'date',
        sortOrder: 'desc',
      },

      getDocumentById: (id) => get().documents.find(d => d.id === id),

      getPendingDocuments: () =>
        get().documents.filter(d => d.status === 'pending'),

      getNewDocuments: () => {
        const cutoff = dayjs().subtract(15, 'day');
        return get().documents.filter(
          d => (d.status === 'pending' || d.isNew) && dayjs(d.createdAt).isAfter(cutoff)
        );
      },

      getFilteredDocuments: () => {
        const { documents, filters, viewRecords } = get();
        let result = [...documents];

        if (filters.status !== 'all') {
          result = result.filter(d => d.status === filters.status);
        }
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            d => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
          );
        }

        // Secondary order (within each priority group): chosen date/alpha sort.
        result.sort((a, b) => {
          let cmp = 0;
          if (filters.sortBy === 'alpha') {
            cmp = a.title.localeCompare(b.title, 'pt-BR');
          } else {
            cmp = dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
          }
          return filters.sortOrder === 'asc' ? -cmp : cmp;
        });

        // Primary order: by status priority — Pendente → Informativo → Aceito/Visualizado → Expirado.
        // Array.sort is stable, so the date/alpha order is preserved within each group.
        return result.sort(
          (a, b) =>
            STATUS_PRIORITY[getDisplayStatus(a, viewRecords)] -
            STATUS_PRIORITY[getDisplayStatus(b, viewRecords)]
        );
      },

      getAcceptanceRecord: (documentId, userId) =>
        get().acceptanceRecords.find(
          r => r.documentId === documentId && r.userId === userId
        ),

      getViewRecord: (documentId, userId) =>
        get().viewRecords.find(
          v => v.documentId === documentId && v.userId === userId
        ),

      setFilter: (patch) =>
        set(state => ({ filters: { ...state.filters, ...patch } })),

      recordAcceptance: (record) =>
        set(state => ({
          // Append-only: frozen record simulating WORM storage
          acceptanceRecords: [...state.acceptanceRecords, freezeRecord(record)],
        })),

      markDocumentAccepted: (documentId) =>
        set(state => ({
          documents: state.documents.map(d =>
            d.id === documentId ? { ...d, status: 'accepted' as const } : d
          ),
        })),

      recordView: (documentId, userId) =>
        set(state => ({
          // Upsert: keep only the latest visualization per document + user
          viewRecords: [
            ...state.viewRecords.filter(
              v => !(v.documentId === documentId && v.userId === userId)
            ),
            { documentId, userId, viewedAt: new Date().toISOString() },
          ],
        })),

      linkDepartmentDocuments: (department) => {
        // Onboarding: ensures pending docs for the user's dept are visible
        set(state => ({
          documents: state.documents.map(d => {
            if (
              d.status === 'pending' &&
              (d.department.includes(department) || d.department.includes('Todos'))
            ) {
              return { ...d, isNew: true };
            }
            return d;
          }),
        }));
      },
    }),
    {
      name: 'portal-document-store',
      // Bump this whenever the mock dataset changes. A version mismatch discards old
      // persisted records (from previous demo runs) so stale data can't break the list
      // — e.g. marking current pending docs as accepted or hiding "Visualizado".
      version: 3,
      migrate: () => ({
        acceptanceRecords: MOCK_ACCEPTANCE_RECORDS,
        viewRecords: MOCK_VIEW_RECORDS,
      }),
      // Only persist acceptance & view records — documents always reload fresh from mock data
      partialize: (state) => ({
        acceptanceRecords: state.acceptanceRecords,
        viewRecords: state.viewRecords,
      }),
      // After rehydration, reflect persisted acceptances back onto the fresh document list
      // so accepted documents don't revert to "pending" on a full page reload.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const acceptedIds = new Set(state.acceptanceRecords.map(r => r.documentId));
        state.documents = state.documents.map(d =>
          acceptedIds.has(d.id) && d.status === 'pending'
            ? { ...d, status: 'accepted' as const }
            : d
        );
      },
    }
  )
);
