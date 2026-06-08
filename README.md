# Portal do Colaborador · Contato Seguro

Portal web para **leitura e aceite eletrônico de documentos** com validade jurídica
(MP 2.200-2/2001), parte do ecossistema **Contato Seguro · Canal de Ética**.
O colaborador acessa a plataforma, lê os documentos pendentes, registra o aceite
(com coleta de evidências) e pode baixar o comprovante. Inclui também áreas de
**Pesquisas** e **Treinamentos**.

> Protótipo de alta fidelidade — dados simulados (mock), sem back-end.

---

## ✨ Funcionalidades

- **Tela de login** simples e responsiva — o colaborador informa o nome (exibido na saudação) ou escolhe **Pular / Ignorar**.
- **Home** com painéis de pendências: **Documentos pendentes**, **Pesquisas pendentes** e **Treinamentos pendentes**, com atalhos no mobile.
- **Listagem de Documentos** com busca, filtros (Todos / Pendentes / Aceitos / Informativos) e ordenação por prioridade de status.
- **Fluxo de aceite eletrônico**:
  - Visualizador de PDF responsivo (paginação, zoom, ajuste à largura).
  - Checkbox de aceite sempre disponível, com **nudge de conformidade** caso o usuário confirme sem abrir o documento.
  - Coleta de **evidências** (IP, data/hora, user agent, hash do documento) e geração de **comprovante em PDF**.
  - Estados: **Aceite pendente → Aceito**.
- **Documentos informativos** com rastreamento de visualização (**Informativo → Visualizado**) e data da última visualização.
- **Experiência responsiva escalável**: Mobile → Tablet → Desktop (barra lateral no desktop, _drawer_ no mobile/tablet).
- **Sair da conta** disponível na navegação.

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| UI | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vitejs.dev/) |
| Componentes | [Ant Design 5](https://ant.design/) |
| Estado | [Zustand](https://zustand-demo.pmnd.rs/) (com `persist`) |
| Rotas | [React Router v7](https://reactrouter.com/) |
| PDF | [react-pdf](https://github.com/wojtekmaj/react-pdf) (leitura) + [jsPDF](https://github.com/parallax/jsPDF) (comprovante) |
| Datas | [Day.js](https://day.js.org/) |

---

## 🚀 Como rodar

Pré-requisitos: **Node.js 18+** e npm.

```bash
# instalar dependências
npm install

# ambiente de desenvolvimento (http://localhost:3000)
npm run dev

# build de produção
npm run build

# pré-visualizar o build
npm run preview
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Type-check (`tsc -b`) + build de produção |
| `npm run preview` | Servidor local do build de produção |
| `npm run lint` | ESLint |

---

## 📁 Estrutura do projeto

```
PortalDoColaborador/
├─ public/                     # logos, imagens, PDF de exemplo, worker do PDF.js
├─ scripts/
│  └─ generate-sample-pdf.mjs  # gera o documento PDF de exemplo
└─ src/
   ├─ components/
   │  ├─ Layout/AppLayout.tsx  # layout responsivo (sidebar / drawer + header + footer)
   │  ├─ Logo/                 # logo oficial Contato Seguro
   │  ├─ BackLink/             # link "< Voltar"
   │  ├─ PDFViewer/            # visualizador de PDF (paginação + zoom)
   │  └─ home/                 # cards e linhas das seções da Home
   ├─ pages/
   │  ├─ LoginPage/            # tela de login
   │  ├─ HomePage/             # painéis de pendências
   │  ├─ DocumentsPage/        # listagem com filtros e ordenação
   │  ├─ DocumentViewerPage/   # leitura + aceite / visualização
   │  ├─ SurveysPage/          # pesquisas
   │  ├─ TrainingsPage/        # treinamentos
   │  └─ FaqPage/              # perguntas frequentes
   ├─ store/
   │  ├─ userStore.ts          # sessão e nome de exibição
   │  └─ documentStore.ts      # documentos, aceites e visualizações
   ├─ hooks/useBreakpoint.ts   # detecção de breakpoint (mobile/tablet/desktop)
   ├─ utils/
   │  ├─ documentStatus.ts     # status de exibição + prioridade de ordenação
   │  ├─ evidence.ts           # coleta de evidências do aceite
   │  ├─ hash.ts               # hash e registro imutável
   │  └─ certificate.ts        # geração do comprovante em PDF
   ├─ theme/tokens.ts          # cores, tipografia e breakpoints
   ├─ mocks/data.ts            # dados simulados
   └─ types/                   # tipos TypeScript
```

---

## 🏛️ Decisões de arquitetura

- **Persistência seletiva:** apenas registros de **aceite** e **visualização** são persistidos no `localStorage`. Os documentos sempre recarregam do mock, garantindo dados consistentes.
- **Store versionado:** o `documentStore` usa `version` + `migrate` para descartar dados antigos quando o conjunto de mock muda, evitando estados inconsistentes em demonstrações.
- **Status de exibição derivado:** `getDisplayStatus` calcula o status mostrado (`Aceite pendente`, `Informativo`, `Visualizado`, `Aceito`, `Expirado`) e a ordem de prioridade da listagem.
- **Evidência e validade jurídica:** o aceite registra IP, data/hora, dispositivo e hash do documento em um log _append-only_, com comprovante exportável (MP 2.200-2/2001).
- **Responsividade:** breakpoints em `mobile (<768)`, `tablet (768–1023)` e `desktop (≥1024)`; a navegação alterna entre barra lateral fixa e _drawer_.

---

## 🎨 Marca

- Cor primária: **navy `#263072`**
- Tipografia: **Montserrat**
- Logo: **Contato Seguro · Canal de Ética**

---

## 📄 Licença

Projeto proprietário — **Contato Seguro**. Uso interno / demonstração.

---

<p align="center">Desenvolvido para o ecossistema <strong>Contato Seguro</strong>.</p>
