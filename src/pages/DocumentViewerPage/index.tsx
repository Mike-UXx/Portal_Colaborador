import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Modal, Result, App as AntApp } from 'antd';
import {
  FilePdfOutlined,
  RightOutlined,
  CheckCircleFilled,
  InfoCircleFilled,
  DownloadOutlined,
} from '@ant-design/icons';
import { AppLayout } from '../../components/Layout/AppLayout';
import { BackLink } from '../../components/BackLink';
import { PDFViewer } from '../../components/PDFViewer';
import { useDocumentStore } from '../../store/documentStore';
import { useUserStore } from '../../store/userStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { collectEvidence } from '../../utils/evidence';
import { generateRecordId } from '../../utils/hash';
import { generateCertificatePDF } from '../../utils/certificate';
import { COLORS } from '../../theme/tokens';
import type { AcceptanceRecord } from '../../types';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const { Title, Text } = Typography;

const fileName = (title: string) =>
  `${title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')}.PDF`;

export const DocumentViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const { isCompact } = useBreakpoint();
  const { currentUser } = useUserStore();
  const { getDocumentById, getAcceptanceRecord, recordAcceptance, markDocumentAccepted, recordView, getViewRecord } =
    useDocumentStore();

  const document = id ? getDocumentById(id) : undefined;
  const existingRecord = id && currentUser ? getAcceptanceRecord(id, currentUser.id) : undefined;

  // Snapshot the PRIOR visualization once, on mount — so the blue "Você visualizou…"
  // box reflects a previous visit only, never the view recorded in this session.
  const [previousView] = useState(() =>
    id && currentUser ? getViewRecord(id, currentUser.id) : undefined
  );

  const [pdfOpen, setPdfOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // Reading-completion gate (replaces the old checkbox): the user must open the
  // document and click "Concluir leitura" before "Aceitar documento" enables.
  const [readCompleted, setReadCompleted] = useState(false);

  // Register a visualization for informative documents once the page is shown.
  useEffect(() => {
    if (document && document.status === 'informative' && currentUser) {
      recordView(document.id, currentUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id]);

  if (!document) {
    return (
      <AppLayout>
        <Result
          status="404"
          title="Documento não encontrado"
          extra={<Button type="primary" onClick={() => navigate('/documentos')}>Voltar para documentos</Button>}
        />
      </AppLayout>
    );
  }

  const isAccepted = document.status === 'accepted' || !!existingRecord;
  const isInformative = document.status === 'informative';
  const isExpired = document.status === 'expired';
  // An active acceptance task locks header-logo navigation
  const isActiveTask = !isAccepted && !isInformative && !isExpired;
  const acceptedAt = existingRecord?.createdAt ?? document.createdAt;
  // The file card shows a "success" look once the active reading was concluded
  const cardDone = isActiveTask && readCompleted;

  const handleDownloadOriginal = () => {
    const link = window.document.createElement('a');
    link.href = document.pdfUrl;
    link.download = fileName(document.title);
    link.target = '_blank';
    link.click();
  };

  const handleDownloadCertificate = () => {
    if (existingRecord) generateCertificatePDF(existingRecord);
  };

  const concluirLeitura = () => {
    setReadCompleted(true);
    setPdfOpen(false);
  };

  const doAccept = async () => {
    if (!readCompleted || !currentUser) return;
    setConfirming(true);
    try {
      const evidence = await collectEvidence(document.hash);
      const record: AcceptanceRecord = {
        id: generateRecordId(),
        documentId: document.id,
        documentTitle: document.title,
        documentVersion: document.version,
        userId: currentUser.id,
        userName: currentUser.name,
        userCpf: currentUser.cpf,
        evidence,
        certificateGenerated: true,
        createdAt: new Date().toISOString(),
      };
      recordAcceptance(record);
      markDocumentAccepted(document.id);
      message.success('Aceite registrado com sucesso! Seu comprovante foi gerado.');
      setTimeout(() => generateCertificatePDF(record), 600);
    } finally {
      setConfirming(false);
    }
  };

  /* -------------------------------- Pieces -------------------------------- */

  // File card → opens the full-screen reader. Turns green once reading is concluded.
  const fileCard = (
    <button
      onClick={() => setPdfOpen(true)}
      style={{
        width: '100%',
        background: cardDone ? COLORS.successBg : COLORS.surface,
        border: `1px solid ${cardDone ? COLORS.successBorder : COLORS.cardBorder}`,
        borderRadius: 10,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'border-color .15s, box-shadow .15s, background .15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(38,48,114,0.08)';
        if (!cardDone) e.currentTarget.style.borderColor = COLORS.blue3;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        if (!cardDone) e.currentTarget.style.borderColor = COLORS.cardBorder;
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: cardDone ? '#fff' : COLORS.blue1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {cardDone ? (
          <CheckCircleFilled style={{ fontSize: 24, color: COLORS.success }} />
        ) : (
          <FilePdfOutlined style={{ fontSize: 22, color: COLORS.primary }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text strong style={{ fontSize: 14, color: COLORS.textHeading }} ellipsis>
          {fileName(document.title)}
        </Text>
        <Text style={{ fontSize: 13, color: cardDone ? COLORS.success : COLORS.textSecondary }}>
          {cardDone ? 'Leitura concluída · toque para reabrir' : 'Toque para abrir o documento'}
        </Text>
      </div>
      <RightOutlined style={{ color: COLORS.textTertiary, fontSize: 14, flexShrink: 0 }} />
    </button>
  );

  // Status notice boxes
  const acceptedBox = (
    <div style={{ background: COLORS.successBg, border: `1px solid ${COLORS.successBorder}`, borderRadius: 8, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <CheckCircleFilled style={{ color: COLORS.success, fontSize: 20, marginTop: 2, flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text strong style={{ fontSize: 14, color: COLORS.textHeading }}>Você aceitou este documento</Text>
        <Text type="secondary" style={{ fontSize: 13 }}>em {dayjs(acceptedAt).format('DD/MM/YYYY [às] HH:mm:ss')}</Text>
      </div>
    </div>
  );

  const viewedBox = (
    <div style={{ background: COLORS.blue1, border: `1px solid ${COLORS.blue3}`, borderRadius: 8, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <InfoCircleFilled style={{ color: COLORS.info, fontSize: 20, marginTop: 2, flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text strong style={{ fontSize: 14, color: COLORS.textHeading }}>Você visualizou este documento</Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          em {previousView ? dayjs(previousView.viewedAt).format('DD/MM/YYYY [às] HH:mm:ss') : ''}
        </Text>
      </div>
    </div>
  );

  // Sticky bottom action bar — buttons only (helper text sits below the card)
  let footerActions: React.ReactNode = null;
  if (isAccepted) {
    footerActions = (
      <>
        <Button type="primary" block size="large" icon={<DownloadOutlined />} onClick={handleDownloadCertificate} style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}>
          Baixar comprovante (PDF)
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} style={{ minHeight: 48, borderRadius: 8 }}>Voltar</Button>
      </>
    );
  } else if (isInformative) {
    footerActions = (
      <>
        <Button type="primary" block size="large" icon={<DownloadOutlined />} onClick={handleDownloadOriginal} style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}>
          Baixar documento (PDF)
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} style={{ minHeight: 48, borderRadius: 8 }}>Voltar</Button>
      </>
    );
  } else if (isExpired) {
    footerActions = (
      <Button block size="large" onClick={() => navigate(-1)} style={{ minHeight: 48, borderRadius: 8 }}>Voltar</Button>
    );
  } else {
    footerActions = (
      <>
        <Button type="primary" block size="large" disabled={!readCompleted} loading={confirming} onClick={doAccept} style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}>
          Aceitar documento
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} disabled={confirming} style={{ minHeight: 48, borderRadius: 8 }}>Cancelar</Button>
      </>
    );
  }

  // Helper/declaration text shown directly below the document card (active task only)
  const belowCardText = isActiveTask ? (
    <Text style={{ fontSize: 13, color: COLORS.textTertiary, lineHeight: 1.5 }}>
      {readCompleted
        ? 'Ao aceitar, você declara que leu e concorda com os termos, condições e diretrizes descritos no documento.'
        : 'Abra o documento e clique em "Concluir leitura" para habilitar o aceite.'}
    </Text>
  ) : null;

  return (
    <AppLayout disableLogoNav={isActiveTask}>
      <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 120, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <BackLink />
          <Title level={3} style={{ margin: '4px 0 2px', color: COLORS.primary, fontWeight: 600 }}>
            {document.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Recebido em {dayjs(document.createdAt).format('DD/MM/YYYY')}
          </Text>
        </div>

        {fileCard}

        {belowCardText}

        {isAccepted && acceptedBox}
        {isInformative && previousView && viewedBox}
        {isExpired && (
          <div style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 8, padding: '14px 16px' }}>
            <Text type="secondary">Este documento expirou e não está mais disponível para aceite.</Text>
          </div>
        )}
      </div>

      {/* Sticky action bar (botões no rodapé, como no formato original) */}
      {footerActions && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: COLORS.surface,
            borderTop: `1px solid ${COLORS.cardBorder}`,
            padding: isCompact ? '12px 16px' : '12px 24px',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
            zIndex: 150,
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {footerActions}
          </div>
        </div>
      )}

      {/* Full-screen reader (overlay) */}
      <Modal
        open={pdfOpen}
        onCancel={() => setPdfOpen(false)}
        footer={null}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FilePdfOutlined style={{ color: COLORS.primary }} />
            <span style={{ fontWeight: 600 }}>{document.title}</span>
          </span>
        }
        width={isCompact ? '100%' : 920}
        style={isCompact ? { top: 0, maxWidth: '100%', margin: 0, padding: 0 } : { top: 20 }}
        styles={{ body: { padding: 0 } }}
        destroyOnHidden
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: isCompact ? 'calc(100dvh - 108px)' : '82vh' }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <PDFViewer url={document.pdfUrl} />
          </div>
          <div
            style={{
              padding: '10px 16px',
              borderTop: `1px solid ${COLORS.cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexShrink: 0,
              background: COLORS.surface,
            }}
          >
            <Button type="text" icon={<DownloadOutlined />} onClick={handleDownloadOriginal} style={{ color: COLORS.textSecondary }}>
              {isCompact ? 'Baixar' : 'Baixar PDF'}
            </Button>
            {isActiveTask ? (
              <Button type="primary" onClick={concluirLeitura} style={{ borderRadius: 8, minHeight: 40, fontWeight: 600 }}>
                Concluir leitura
              </Button>
            ) : (
              <Button type="primary" onClick={() => setPdfOpen(false)} style={{ borderRadius: 8, minHeight: 40, fontWeight: 600 }}>
                Fechar
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};
