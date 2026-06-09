import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Checkbox, Result, App as AntApp } from 'antd';
import { CheckCircleFilled, InfoCircleFilled, DownloadOutlined } from '@ant-design/icons';
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

  const [checked, setChecked] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // The document is now embedded inline — "opening" = it being presented on screen.
  // The acceptance checkbox stays disabled until the document has loaded (#1-A).
  const [docLoaded, setDocLoaded] = useState(false);

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

  /* -------------------------------- Pieces -------------------------------- */

  const header = (
    <>
      <BackLink />
      <Title level={3} style={{ margin: '4px 0 2px', color: COLORS.primary, fontWeight: 600 }}>
        {document.title}
      </Title>
      <Text type="secondary" style={{ fontSize: 14 }}>
        Recebido em {dayjs(document.createdAt).format('DD/MM/YYYY')}
      </Text>
    </>
  );

  // Embedded document viewer (read inline — no modal)
  const renderViewer = (height: React.CSSProperties['height']) => (
    <div
      style={{
        height,
        minHeight: 340,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 10,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <PDFViewer url={document.pdfUrl} onTotalPages={n => { if (n > 0) setDocLoaded(true); }} />
    </div>
  );

  const noticeBox = (
    color: string,
    bg: string,
    border: string,
    icon: React.ReactNode,
    title: string,
    subtitle: string
  ) => (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: '14px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <span style={{ color, fontSize: 20, marginTop: 2, flexShrink: 0, display: 'inline-flex' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text strong style={{ fontSize: 14, color: COLORS.textHeading }}>{title}</Text>
        <Text type="secondary" style={{ fontSize: 13 }}>{subtitle}</Text>
      </div>
    </div>
  );

  const sidePanelBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isAccepted &&
        noticeBox(
          COLORS.success, COLORS.successBg, COLORS.successBorder,
          <CheckCircleFilled />, 'Você aceitou este documento',
          `em ${dayjs(acceptedAt).format('DD/MM/YYYY [às] HH:mm:ss')}`
        )}

      {isInformative && previousView &&
        noticeBox(
          COLORS.info, COLORS.blue1, COLORS.blue3,
          <InfoCircleFilled />, 'Você visualizou este documento',
          `em ${dayjs(previousView.viewedAt).format('DD/MM/YYYY [às] HH:mm:ss')}`
        )}

      {isExpired && (
        <div style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 8, padding: '14px 16px' }}>
          <Text type="secondary">Este documento expirou e não está mais disponível para aceite.</Text>
        </div>
      )}

      {isActiveTask && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Recomendamos a leitura integral do documento antes de confirmar o aceite.
          </Text>
          <Checkbox
            checked={checked}
            disabled={!docLoaded}
            onChange={e => setChecked(e.target.checked)}
            style={{ alignItems: 'flex-start' }}
          >
            <Text style={{ fontSize: 14, color: docLoaded ? COLORS.textHeading : COLORS.textDisabled }}>
              Li e aceito os termos, condições e diretrizes descritos no documento apresentado
            </Text>
          </Checkbox>
          {!docLoaded && (
            <Text style={{ fontSize: 12, color: COLORS.textTertiary }}>
              O aceite será habilitado assim que o documento for exibido.
            </Text>
          )}
        </div>
      )}
    </div>
  );

  let actions: React.ReactNode = null;
  if (isAccepted) {
    actions = (
      <>
        <Button type="primary" block size="large" icon={<DownloadOutlined />} onClick={handleDownloadCertificate} style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}>
          Baixar comprovante (PDF)
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} style={{ minHeight: 48, borderRadius: 8 }}>Voltar</Button>
      </>
    );
  } else if (isInformative) {
    actions = (
      <>
        <Button type="primary" block size="large" icon={<DownloadOutlined />} onClick={handleDownloadOriginal} style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}>
          Baixar documento (PDF)
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} style={{ minHeight: 48, borderRadius: 8 }}>Voltar</Button>
      </>
    );
  } else if (isExpired) {
    actions = (
      <Button block size="large" onClick={() => navigate(-1)} style={{ minHeight: 48, borderRadius: 8 }}>Voltar</Button>
    );
  } else {
    actions = (
      <>
        <Button type="primary" block size="large" disabled={!checked} loading={confirming} onClick={doAccept} style={{ minHeight: 48, borderRadius: 8, fontWeight: 600 }}>
          Confirmar
        </Button>
        <Button block size="large" onClick={() => navigate(-1)} disabled={confirming} style={{ minHeight: 48, borderRadius: 8 }}>Cancelar</Button>
      </>
    );
  }

  /* -------------------------- Desktop (two columns) ------------------------- */
  if (!isCompact) {
    return (
      <AppLayout disableLogoNav={isActiveTask}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>{header}</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>{renderViewer('calc(100vh - 232px)')}</div>
            <aside style={{ width: 372, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sidePanelBody}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{actions}</div>
            </aside>
          </div>
        </div>
      </AppLayout>
    );
  }

  /* ----------------------- Mobile / tablet (stacked) ------------------------ */
  return (
    <AppLayout disableLogoNav={isActiveTask}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: actions ? 140 : 16 }}>
        <div>{header}</div>
        {renderViewer('58vh')}
        {sidePanelBody}
      </div>

      {/* Sticky action bar */}
      {actions && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: COLORS.surface,
            borderTop: `1px solid ${COLORS.cardBorder}`,
            padding: '12px 16px',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
            zIndex: 150,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{actions}</div>
        </div>
      )}
    </AppLayout>
  );
};
