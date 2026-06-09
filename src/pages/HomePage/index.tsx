import React from 'react';
import { Typography, App as AntApp } from 'antd';
import { FileTextOutlined, FormOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/Layout/AppLayout';
import { SectionCard, PendingRow, StatusTag, VerMaisFooter, ShortcutCard } from '../../components/home';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useDocumentStore } from '../../store/documentStore';
import { useUserStore } from '../../store/userStore';
import { MOCK_SURVEYS, MOCK_TRAININGS } from '../../mocks/data';
import { getDisplayStatus } from '../../utils/documentStatus';
import { COLORS } from '../../theme/tokens';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const { Title, Text } = Typography;

const HOME_DOC_LIMIT = 3;

// Replaces the redundant "pendente" tag with useful deadline/urgency info.
// (On the Home, every item in a "pendentes" section is already pending.)
function deadlineChip(deadlineIso: string): React.ReactNode {
  const days = dayjs(deadlineIso).startOf('day').diff(dayjs().startOf('day'), 'day');
  if (days < 0) return <StatusTag preset="warning">Atrasado</StatusTag>;
  if (days === 0) return <StatusTag preset="warning">Vence hoje</StatusTag>;
  if (days <= 7) return <StatusTag preset="warning">{`Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`}</StatusTag>;
  return <StatusTag preset="neutral">{`Vence em ${days} dias`}</StatusTag>;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const { isDesktop } = useBreakpoint();
  const displayName = useUserStore(s => s.displayName);
  const documents = useDocumentStore(s => s.documents);
  const viewRecords = useDocumentStore(s => s.viewRecords);
  const setFilter = useDocumentStore(s => s.setFilter);

  const futureFlow = () => message.info('Este fluxo será criado em uma versão futura.');

  // Open the Documents page already filtered (the "Ver mais" of pendentes → only Pendentes).
  const openDocuments = (status: 'all' | 'pending') => {
    setFilter({ status });
    navigate('/documentos');
  };

  // "Documentos pendentes" na Home = EXCLUSIVAMENTE documentos com Aceite pendente.
  // Informativos, aceitos e visualizados não aparecem aqui.
  const attentionDocs = documents
    .filter(d => getDisplayStatus(d, viewRecords) === 'pending')
    .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  const visibleDocs = attentionDocs.slice(0, HOME_DOC_LIMIT);
  const remainingDocs = attentionDocs.length - visibleDocs.length;

  const pendingSurveys = MOCK_SURVEYS.filter(s => s.status === 'pending');
  const pendingTrainings = MOCK_TRAININGS.filter(t => t.status === 'pending');

  const fmt = (iso: string) => dayjs(iso).format('DD/MM/YYYY');

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Greeting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Title level={3} style={{ margin: 0, color: COLORS.primary, fontWeight: 600 }}>
            Olá, {displayName ?? '[nome do colaborador]'}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Último login: {dayjs().subtract(1, 'day').format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>

        {/* Documentos pendentes */}
        <SectionCard
          title="Documentos pendentes"
          count={attentionDocs.length}
          emptyText="Nenhuma pendência no momento"
          footer={
            remainingDocs > 0 ? (
              <VerMaisFooter count={remainingDocs} onClick={() => openDocuments('pending')} />
            ) : undefined
          }
        >
          {visibleDocs.map((doc, i) => (
            <PendingRow
              key={doc.id}
              title={doc.title}
              meta={`Recebido em: ${fmt(doc.createdAt)}`}
              actionLabel="Ler e aceitar"
              onAction={() => navigate(`/documentos/${doc.id}`)}
              last={i === visibleDocs.length - 1}
            />
          ))}
        </SectionCard>

        {/* Pesquisas pendentes */}
        <SectionCard
          title="Pesquisas pendentes"
          count={pendingSurveys.length}
          emptyText="Nenhuma pendência no momento"
        >
          {pendingSurveys.map((s, i) => (
            <PendingRow
              key={s.id}
              tag={deadlineChip(s.deadline)}
              title={s.title}
              meta={`Prazo: ${fmt(s.deadline)}`}
              actionLabel="Responder"
              onAction={futureFlow}
              last={i === pendingSurveys.length - 1}
            />
          ))}
        </SectionCard>

        {/* Treinamentos pendentes */}
        <SectionCard
          title="Treinamentos pendentes"
          count={pendingTrainings.length}
          emptyText="Nenhuma pendência no momento"
        >
          {pendingTrainings.map((t, i) => (
            <PendingRow
              key={t.id}
              tag={deadlineChip(t.deadline)}
              title={t.title}
              meta={`Prazo: ${fmt(t.deadline)}`}
              actionLabel="Assistir"
              onAction={futureFlow}
              last={i === pendingTrainings.length - 1}
            />
          ))}
        </SectionCard>

        {/* Atalhos — apenas em mobile/tablet (no desktop a barra lateral já oferece a navegação) */}
        {!isDesktop && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Title level={5} style={{ margin: 0, color: COLORS.textHeading }}>
              Atalhos
            </Title>
            <div style={{ display: 'flex', gap: 12 }}>
              <ShortcutCard icon={<FileTextOutlined />} label="Documentos" onClick={() => openDocuments('all')} />
              <ShortcutCard icon={<FormOutlined />} label="Pesquisas" onClick={() => navigate('/pesquisas')} />
              <ShortcutCard icon={<PlayCircleOutlined />} label="Treinamentos" onClick={() => navigate('/treinamentos')} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
