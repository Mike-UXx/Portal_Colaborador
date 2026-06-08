// Generates a clean, professional sample PDF (acceptance-document style) for demo use.
import { jsPDF } from 'jspdf';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public');
mkdirSync(outDir, { recursive: true });

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
const W = doc.internal.pageSize.getWidth(); // 210
const H = doc.internal.pageSize.getHeight(); // 297
const M = 22;
const CONTENT_TOP = 30;
const CONTENT_BOTTOM = H - 20;
const NAVY = [38, 48, 114];

let y = CONTENT_TOP;
let pageNum = 0;

function header() {
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, W, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CONTATO SEGURO', M, 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Plataforma de Gestão de Documentos', W - M, 10, { align: 'right' });
}

function footer() {
  doc.setDrawColor(225, 225, 225);
  doc.setLineWidth(0.3);
  doc.line(M, H - 15, W - M, H - 15);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Documento confidencial — uso interno', M, H - 10);
  doc.text(`Página ${pageNum}`, W - M, H - 10, { align: 'right' });
}

function newPage(first = false) {
  if (!first) doc.addPage();
  pageNum += 1;
  header();
  footer();
  y = CONTENT_TOP;
}

function ensure(space) {
  if (y + space > CONTENT_BOTTOM) newPage();
}

function docTitle(text) {
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.splitTextToSize(text, W - 2 * M).forEach((line) => {
    doc.text(line, M, y);
    y += 8.5;
  });
  y += 1;
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Versão 3.1  ·  Vigente a partir de 01/01/2026  ·  Classificação: Interno', M, y);
  y += 4;
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setLineWidth(0.6);
  doc.line(M, y, M + 28, y);
  y += 8;
}

function heading(text) {
  ensure(16);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text(text, M, y);
  y += 7;
}

function paragraph(text) {
  doc.setTextColor(55, 55, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const lh = 5.3;
  doc.splitTextToSize(text, W - 2 * M).forEach((line) => {
    ensure(lh);
    doc.text(line, M, y);
    y += lh;
  });
  y += 3.5;
}

function bullet(text) {
  doc.setTextColor(55, 55, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const lh = 5.3;
  const lines = doc.splitTextToSize(text, W - 2 * M - 6);
  lines.forEach((line, i) => {
    ensure(lh);
    if (i === 0) {
      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.circle(M + 1.2, y - 1.4, 0.8, 'F');
    }
    doc.text(line, M + 6, y);
    y += lh;
  });
  y += 1.5;
}

// ----------------------------- Content -----------------------------
newPage(true);
docTitle('Política de Privacidade e Proteção de Dados');

paragraph(
  'Esta Política estabelece as diretrizes e os princípios adotados pela Contato Seguro para o tratamento de dados pessoais de colaboradores, clientes e parceiros, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD) e demais normas aplicáveis. Ao confirmar o aceite, o colaborador declara ter lido, compreendido e concordado integralmente com o conteúdo deste documento.'
);

heading('1. Objetivo');
paragraph(
  'Definir as regras para coleta, uso, armazenamento, compartilhamento e descarte de dados pessoais, garantindo a privacidade, a segurança e os direitos dos titulares, bem como a transparência das operações de tratamento realizadas pela organização.'
);

heading('2. Abrangência');
paragraph(
  'Aplica-se a todos os colaboradores, estagiários, prestadores de serviço e terceiros que, no exercício de suas atividades, tenham acesso a dados pessoais sob a responsabilidade da Contato Seguro, independentemente do meio ou formato em que estejam armazenados.'
);

heading('3. Princípios do Tratamento');
paragraph('O tratamento de dados pessoais observará os seguintes princípios:');
bullet('Finalidade: realizado para propósitos legítimos, específicos e informados ao titular.');
bullet('Adequação e necessidade: limitado ao mínimo necessário para o alcance das finalidades.');
bullet('Transparência: informações claras e acessíveis sobre o tratamento realizado.');
bullet('Segurança: medidas técnicas e administrativas aptas a proteger os dados.');
bullet('Responsabilização: demonstração da adoção de medidas eficazes de conformidade.');

heading('4. Direitos dos Titulares');
paragraph(
  'É assegurado ao titular o direito de obter, a qualquer momento e mediante requisição, a confirmação da existência de tratamento, o acesso aos dados, a correção de informações incompletas ou desatualizadas, a anonimização, o bloqueio ou a eliminação de dados desnecessários, bem como a portabilidade e a revogação do consentimento, nos termos da legislação vigente.'
);

heading('5. Segurança da Informação');
paragraph(
  'A organização adota controles de acesso, criptografia, registro de atividades (logs) e mecanismos de prevenção a incidentes para resguardar a integridade, a confidencialidade e a disponibilidade dos dados pessoais. Eventuais incidentes de segurança serão tratados conforme o plano de resposta a incidentes e comunicados às autoridades competentes quando aplicável.'
);

heading('6. Responsabilidades do Colaborador');
paragraph('São deveres do colaborador no tratamento de dados pessoais:');
bullet('Utilizar os dados exclusivamente para as finalidades autorizadas.');
bullet('Proteger credenciais de acesso e não compartilhá-las com terceiros.');
bullet('Comunicar imediatamente qualquer suspeita de incidente de segurança.');
bullet('Cumprir as normas internas e a legislação aplicável de proteção de dados.');

heading('7. Penalidades');
paragraph(
  'O descumprimento desta Política poderá ensejar a aplicação de medidas disciplinares, conforme a gravidade da conduta, sem prejuízo das sanções civis, administrativas e penais previstas na legislação. A reincidência será considerada agravante na dosimetria das medidas cabíveis.'
);

heading('8. Disposições Finais');
paragraph(
  'Esta Política entra em vigor na data de sua publicação e poderá ser revista periodicamente para refletir mudanças legais, regulatórias ou operacionais. O registro eletrônico do aceite, incluindo data, hora e identificação do dispositivo, possui validade jurídica nos termos da MP 2.200-2/2001 e será mantido em log imutável para fins de auditoria e conformidade.'
);

const pdfBytes = doc.output('arraybuffer');
writeFileSync(resolve(outDir, 'sample-document.pdf'), Buffer.from(pdfBytes));
console.log(`✅ Generated public/sample-document.pdf (${pageNum} page(s))`);
