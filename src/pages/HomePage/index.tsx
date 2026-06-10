import React from 'react';
import { Typography, App as AntApp } from 'antd';
import { FileTextOutlined, FormOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/Layout/AppLayout';
import { SectionCard, PendingRow, StatusTag, VerMaisFooter, ShortcutCard, HomeBanner } from '../../components/home';
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

// Announcements shown on the Home (newest last). Each has a stable id — to launch a
// new one, add an entry with a NEW id and it reappears for everyone (even who dismissed
// previous ones). Dismissed ids are remembered per user (see userStore.dismissedBanners).
interface Announcement {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaTo?: string;
}
// No active announcements for now — only the welcome banner is shown.
// To launch one, add an entry with a NEW id and it appears for everyone.
const ANNOUNCEMENTS: Announcement[] = [];

// Replaces the redundant "pendente" tag with useful, color-coded urgency info.
// (On the Home, every item in a "pendentes" section is already pending.)
//   🔴 vermelho: vence hoje/atrasado ou em ≤ 2 dias
//   🟡 amarelo:  3–7 dias
//   🔵 azul:     8+ dias
function deadlineChip(deadlineIso: string): React.ReactNode {
  const days = dayjs(deadlineIso).startOf('day').diff(dayjs().startOf('day'), 'day');
  if (days < 0) return <StatusTag preset="danger">Atrasado</StatusTag>;
  if (days === 0) return <StatusTag preset="danger">Vence hoje</StatusTag>;
  const label = `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`;
  if (days <= 2) return <StatusTag preset="danger">{label}</StatusTag>;
  if (days <= 7) return <StatusTag preset="warning">{label}</StatusTag>;
  return <StatusTag preset="info">{label}</StatusTag>;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const { isDesktop } = useBreakpoint();
  const displayName = useUserStore(s => s.displayName);
  const dismissedBanners = useUserStore(s => s.dismissedBanners);
  const dismissBanner = useUserStore(s => s.dismissBanner);
  const documents = useDocumentStore(s => s.documents);
  const viewRecords = useDocumentStore(s => s.viewRecords);
  const setFilter = useDocumentStore(s => s.setFilter);

  const futureFlow = () => message.info('Este fluxo será criado em uma versão futura.');

  // One banner at a time: welcome on first access, then the latest non-dismissed announcement.
  let banner: React.ReactNode = null;
  if (!dismissedBanners.includes('welcome')) {
    banner = (
      <HomeBanner
        kind="welcome"
        title="Bem-vindo ao seu Portal!"
        body="Assine documentos com validade jurídica, responda pesquisas e faça seus treinamentos em um só lugar."
        onDismiss={() => dismissBanner('welcome')}
      />
    );
  } else {
    const ann = [...ANNOUNCEMENTS].reverse().find(a => !dismissedBanners.includes(a.id));
    if (ann) {
      banner = (
        <HomeBanner
          kind="announcement"
          icon={ann.icon}
          title={ann.title}
          body={ann.body}
          ctaLabel={ann.ctaLabel}
          onCta={ann.ctaTo ? () => navigate(ann.ctaTo!) : undefined}
          onDismiss={() => dismissBanner(ann.id)}
        />
      );
    }
  }

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

        {/* Welcome / announcement banner (dismissible) */}
        {banner}

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
