import jsPDF from 'jspdf';
import type { AcceptanceRecord } from '../types';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export function generateCertificatePDF(record: AcceptanceRecord): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;

  // Header bar
  doc.setFillColor(0, 82, 204);
  doc.rect(0, 0, pageW, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROVANTE DE ACEITE ELETRÔNICO', pageW / 2, 13, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Plataforma de Gestão de Documentos — Contato Seguro', pageW / 2, 22, { align: 'center' });

  // Reset color
  doc.setTextColor(30, 30, 30);

  let y = 45;

  // Title block
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Documento', margin, y);
  y += 7;
  doc.setLineWidth(0.4);
  doc.setDrawColor(0, 82, 204);
  doc.line(margin, y, margin + contentW, y);
  y += 7;

  const field = (label: string, value: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 45, y);
    y += 7;
  };

  field('Título', record.documentTitle);
  field('Versão', record.documentVersion);
  field('ID do Documento', record.documentId);

  y += 5;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Colaborador', margin, y);
  y += 7;
  doc.setDrawColor(0, 82, 204);
  doc.line(margin, y, margin + contentW, y);
  y += 7;

  field('Nome', record.userName);
  field('CPF', record.userCpf);
  field('ID do Usuário', record.userId);

  y += 5;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Evidências do Aceite', margin, y);
  y += 7;
  doc.setDrawColor(0, 82, 204);
  doc.line(margin, y, margin + contentW, y);
  y += 7;

  const ts = dayjs(record.evidence.timestamp).format('DD/MM/YYYY [às] HH:mm:ss [UTC]');
  field('Data e Hora', ts);
  field('Endereço IP', record.evidence.ip);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('User Agent:', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const uaLines = doc.splitTextToSize(record.evidence.userAgent, contentW);
  doc.text(uaLines, margin, y);
  y += uaLines.length * 5 + 4;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Hash do Documento:', margin, y);
  y += 6;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  const hashLines = doc.splitTextToSize(record.evidence.documentHash, contentW);
  doc.text(hashLines, margin, y);
  y += hashLines.length * 5 + 8;

  // Legal note box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, 'FD');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const legal =
    'Este comprovante constitui evidência jurídica de aceite eletrônico com validade legal ' +
    'nos termos da Medida Provisória 2.200-2/2001, que institui a Infraestrutura de Chaves Públicas ' +
    'Brasileira (ICP-Brasil). O aceite foi realizado de forma livre, consciente e inequívoca pelo ' +
    'titular identificado acima, com registro de evidências digitais imutáveis.';
  const legalLines = doc.splitTextToSize(legal, contentW - 8);
  doc.text(legalLines, margin + 4, y + 6);

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(240, 242, 245);
  doc.rect(0, pageH - 15, pageW, 15, 'F');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Gerado em ${dayjs().format('DD/MM/YYYY HH:mm:ss')} — ID do Registro: ${record.id}`,
    pageW / 2,
    pageH - 7,
    { align: 'center' }
  );

  doc.save(`comprovante_aceite_${record.documentId}_${record.userId}.pdf`);
}
