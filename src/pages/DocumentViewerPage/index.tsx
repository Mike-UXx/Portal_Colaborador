import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Checkbox, Modal, Result, App as AntApp } from 'antd';
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
  const { message, modal } = AntApp.useApp();
  const { isCompact } = useBreakpoint();
  const { currentUser } = useUserStore();
  const { getDocumentById, getAcceptanceRecord, recordAcceptance, markDocumentAccepted, recordView, getViewRecord } =
    useDocumentStore();

  const document = id ? getDocumentById(id) : undefined;
  const existingRecord = id && currentUser ? getAcceptanceRecord(id, currentUser.id) : undefined;

  // Snapshot the PRIOR visualization once, on mount. The blue "Você visualizou…" box
  // reflects a previous visit only — never a view recorded during the current session.
  // This way, pending (never-viewed) informative documents don't show the message.
  const [previousView] = useState(() =>
    id && currentUser ? getViewRecord(id, currentUser.id) : undefined
  );

  const [pdfOpen, setPdfOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [hasOpenedPdf, setHasOpenedPdf] = useState(false);

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

  const acceptedAt = existingRecord?.createdAt ?? document.createdAt;

  const openPdf = () => {
    setPdfOpen(true);
    setHasOpenedPdf(true);
    // Register a visualization for informative documents (updates "last viewed")
    if (isInformative && currentUser) recordView(document.id, currentUser.id);
  };
  const closePdf = () => setPdfOpen(false);

  const handleDownloadOriginal = () => {
    const link = window.document.createElement('a');
    link.href = document.pdfUrl;
    link.download = fileName(document.title);
    link.target = '_blank';
    link.click();
  };

  const handleDownloadCertificate = () => {
    if (existingRecord) {
      generateCertificatePDF(existingRecord);
    }
  };

  const doAccept = async () => {
    if (!checked || !currentUser) return;
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

  const handleConfirm = () => {
    if (!checked || !currentUser) return;
    // Conformity nudge: confirming without ever opening the document
    if (!hasOpenedPdf) {
      modal.confirm({
        title: 'Você ainda não abriu o documento',
        content:
          'Recomendamos a leitura completa do documento antes de confirmar. Deseja confirmar o aceite mesmo assim?',
        okText: 'Confirmar mesmo assim',
        cancelText: 'Cancelar',
        centered: true,
        okButtonProps: { style: { background: COLORS.primary, borderColor: COLORS.primary } },
        onOk: () => doAccept(),
      });
      return;
    }
    doAccept();
  };

  /* ------------------------------- Sub-views ------------------------------- */
  // An active acceptance task locks header-logo navigation
  const isActiveTask = !isAccepted && !isInformative && !isExpired;

  const FileCard = (
    <button
      onClick={openPdf}
      style={{
        width: '100%',
        background: COLORS.surface,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textAlign: 'left',
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = COLORS.blue3;
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(38,48,114,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = COLORS.cardBorder;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: COLORS.blue1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FilePdfOutlined style={{ fontSize: 22, color: COLORS.primary }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text strong style={{ fontSize: 14, color: COLORS.textHeading }} ellipsis>
          {fileName(document.title)}
        </Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Toque para abrir o documento
        </Text>
      </div>
      <RightOutlined style={{ color: COLORS.textTertiary, fontSize: 14, flexShrink: 0 }} />
    </button>
  );

  // Footer actions vary by state
  let footerActions: React.ReactNode = null;
  if (isAccepted) {
    footerActions = (
      <>
        <Button
          type="primary"
          block
          size="large"
          icon={<DownloadOutlined />}
          onClick={handleDownloadCertificate}
          style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}
        >
          Baixar comprovante (PDF)
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} style={{ minHeight: 48, borderRadius: 8 }}>
          Voltar
        </Button>
      </>
    );
  } else if (isInformative) {
    footerActions = (
      <>
        <Button
          type="primary"
          block
          size="large"
          icon={<DownloadOutlined />}
          onClick={handleDownloadOriginal}
          style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}
        >
          Baixar documento (PDF)
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} style={{ minHeight: 48, borderRadius: 8 }}>
          Voltar
        </Button>
      </>
    );
  } else if (!isExpired) {
    footerActions = (
      <>
        <Button
          type="primary"
          block
          size="large"
          disabled={!checked}
          loading={confirming}
          onClick={handleConfirm}
          style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}
        >
          Confirmar
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} disabled={confirming} style={{ minHeight: 48, borderRadius: 8 }}>
          Cancelar
        </Button>
      </>
    );
  }

  return (
    <AppLayout disableLogoNav={isActiveTask}>
      <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 120 }}>
        <BackLink />
        <Title level={3} style={{ margin: '4px 0 2px', color: COLORS.primary, fontWeight: 600 }}>
          {document.title}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Recebido em {dayjs(document.createdAt).format('DD/MM/YYYY')}
        </Text>

        <div style={{ marginTop: 20 }}>{FileCard}</div>

        {/* Accepted confirmation box */}
        {isAccepted && (
          <div
            style={{
              marginTop: 16,
              background: COLORS.successBg,
              border: `1px solid ${COLORS.successBorder}`,
              borderRadius: 8,
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <CheckCircleFilled style={{ color: COLORS.success, fontSize: 20, marginTop: 2, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Text strong style={{ fontSize: 14, color: COLORS.textHeading }}>
                Você aceitou este documento
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                em {dayjs(acceptedAt).format('DD/MM/YYYY [às] HH:mm:ss')}
              </Text>
            </div>
          </div>
        )}

        {/* Informative — shows ONLY when there was a prior visualization (previous visit) */}
        {isInformative && previousView && (
          <div
            style={{
              marginTop: 16,
              background: COLORS.blue1,
              border: `1px solid ${COLORS.blue3}`,
              borderRadius: 8,
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <InfoCircleFilled style={{ color: COLORS.info, fontSize: 20, marginTop: 2, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Text strong style={{ fontSize: 14, color: COLORS.textHeading }}>
                Você visualizou este documento
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                em {dayjs(previousView.viewedAt).format('DD/MM/YYYY [às] HH:mm:ss')}
              </Text>
            </div>
          </div>
        )}

        {/* Pending acceptance — read hint + checkbox */}
        {!isAccepted && !isInformative && !isExpired && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Recomendamos a leitura integral do documento antes de confirmar o aceite.
            </Text>
            <Checkbox
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              style={{ alignItems: 'flex-start' }}
            >
              <Text style={{ fontSize: 14, color: COLORS.textHeading }}>
                Li e aceito os termos, condições e diretrizes descritos no documento apresentado
              </Text>
            </Checkbox>
          </div>
        )}

        {isExpired && (
          <div
            style={{
              marginTop: 16,
              background: '#fafafa',
              border: '1px solid #d9d9d9',
              borderRadius: 8,
              padding: '14px 16px',
            }}
          >
            <Text type="secondary">Este documento expirou e não está mais disponível para aceite.</Text>
          </div>
        )}
      </div>

      {/* Sticky action bar */}
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
          <div
            style={{
              maxWidth: 720,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {footerActions}
          </div>
        </div>
      )}

      {/* PDF reader modal */}
      <Modal
        open={pdfOpen}
        onCancel={closePdf}
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: isCompact ? 'calc(100dvh - 108px)' : '82vh',
          }}
        >
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
            <Button type="primary" onClick={closePdf} style={{ borderRadius: 8, minHeight: 40, fontWeight: 600 }}>
              Concluir leitura
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};
