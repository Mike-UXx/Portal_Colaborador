import React from 'react';
import { Input, Segmented, Select, Typography, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/Layout/AppLayout';
import { BackLink } from '../../components/BackLink';
import { SectionCard, PendingRow, StatusTag } from '../../components/home';
import { useDocumentStore } from '../../store/documentStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { getDisplayStatus, type DisplayStatus } from '../../utils/documentStatus';
import { COLORS } from '../../theme/tokens';
import type { DocumentStatus } from '../../types';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const { Title, Text } = Typography;

const STATUS_TABS: { label: string; value: DocumentStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Aceitos', value: 'accepted' },
  { label: 'Informativos', value: 'informative' },
];

const statusMeta = (ds: DisplayStatus): { tag: React.ReactNode; action: string | null } => {
  switch (ds) {
    case 'pending':
      return { tag: <StatusTag preset="warning">Aceite pendente</StatusTag>, action: 'Ler e aceitar' };
    case 'informative':
      return { tag: <StatusTag preset="info">Informativo</StatusTag>, action: 'Visualizar' };
    case 'visualizado':
      return { tag: <StatusTag preset="success">Visualizado</StatusTag>, action: 'Visualizar' };
    case 'accepted':
      return { tag: <StatusTag preset="success">Aceito</StatusTag>, action: 'Visualizar' };
    case 'expired':
      return { tag: <StatusTag preset="neutral">Expirado</StatusTag>, action: null };
  }
};

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isCompact } = useBreakpoint();
  const { filters, setFilter, getFilteredDocuments } = useDocumentStore();
  const viewRecords = useDocumentStore(s => s.viewRecords);
  const documents = getFilteredDocuments();

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <BackLink />
          <Title level={3} style={{ margin: 0, color: COLORS.primary, fontWeight: 600 }}>
            Documentos
          </Title>
        </div>

        {/* Search & filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            prefix={<SearchOutlined style={{ color: COLORS.textTertiary }} />}
            placeholder="Buscar por título ou categoria..."
            value={filters.search}
            onChange={e => setFilter({ search: e.target.value })}
            allowClear
            size="large"
            style={{ borderRadius: 8, maxWidth: 480 }}
          />
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexDirection: isCompact ? 'column' : 'row',
              alignItems: isCompact ? 'stretch' : 'center',
            }}
          >
            <div style={{ flex: 1, overflowX: 'auto' }}>
              <Segmented
                options={STATUS_TABS.map(t => ({ label: t.label, value: t.value }))}
                value={filters.status}
                onChange={v => setFilter({ status: v as DocumentStatus | 'all' })}
              />
            </div>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={v => {
                const [sortBy, sortOrder] = v.split('-') as ['date' | 'alpha', 'asc' | 'desc'];
                setFilter({ sortBy, sortOrder });
              }}
              style={{ minWidth: 150 }}
              options={[
                { label: 'Mais recentes', value: 'date-desc' },
                { label: 'Mais antigos', value: 'date-asc' },
                { label: 'A → Z', value: 'alpha-asc' },
                { label: 'Z → A', value: 'alpha-desc' },
              ]}
            />
          </div>
        </div>

        {/* List */}
        {documents.length === 0 ? (
          <div style={{ paddingTop: 40 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <Text strong>Nenhum documento encontrado</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>Tente ajustar os filtros de busca.</Text>
                </div>
              }
            />
          </div>
        ) : (
          <>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {documents.length} documento(s) encontrado(s)
            </Text>
            <SectionCard title="Todos os documentos">
              {documents.map((doc, i) => {
                const { tag, action } = statusMeta(getDisplayStatus(doc, viewRecords));
                return (
                  <PendingRow
                    key={doc.id}
                    tag={tag}
                    title={doc.title}
                    meta={`Recebido em: ${dayjs(doc.createdAt).format('DD/MM/YYYY')}`}
                    actionLabel={action ?? '—'}
                    onAction={() => action && navigate(`/documentos/${doc.id}`)}
                    last={i === documents.length - 1}
                  />
                );
              })}
            </SectionCard>
          </>
        )}
      </div>
    </AppLayout>
  );
};
