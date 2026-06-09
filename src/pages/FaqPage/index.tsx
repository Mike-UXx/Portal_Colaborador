import React from 'react';
import { Typography, Collapse } from 'antd';
import { AppLayout } from '../../components/Layout/AppLayout';
import { BackLink } from '../../components/BackLink';
import { COLORS } from '../../theme/tokens';

const { Title, Paragraph } = Typography;

const FAQ_ITEMS = [
  {
    key: '1',
    label: 'O aceite eletrônico tem validade jurídica?',
    children:
      'Sim. O aceite eletrônico possui validade jurídica nos termos da MP 2.200-2/2001. Registramos IP, data/hora e identificação do dispositivo como evidência em log imutável.',
  },
  {
    key: '2',
    label: 'Preciso ler o documento inteiro antes de aceitar?',
    children:
      'Recomendamos fortemente a leitura integral do documento. A confirmação do aceite é habilitada assim que o documento é exibido na tela — depois basta marcar "Li e aceito os termos" e confirmar.',
  },
  {
    key: '3',
    label: 'Como faço para baixar meu comprovante de aceite?',
    children:
      'Abra novamente o documento já aceito e clique em "Baixar comprovante (PDF)". O comprovante registra a data/hora e as evidências do aceite.',
  },
  {
    key: '4',
    label: 'Qual a diferença entre documento informativo e de aceite?',
    children:
      'Documentos informativos são apenas para leitura e não exigem aceite. Documentos de aceite exigem sua confirmação para conformidade.',
  },
  {
    key: '5',
    label: 'O que acontece se eu não aceitar um documento no prazo?',
    children:
      'O documento permanece pendente até o aceite. Documentos expirados deixam de aceitar confirmações e devem ser reenviados pela área responsável.',
  },
];

export const FaqPage: React.FC = () => {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <BackLink />
          <Title level={3} style={{ margin: 0, color: COLORS.primary, fontWeight: 600 }}>
            Perguntas frequentes
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Tire suas dúvidas sobre aceites eletrônicos, documentos e conformidade.
          </Paragraph>
        </div>

        <Collapse
          accordion
          items={FAQ_ITEMS}
          style={{ background: COLORS.surface, borderRadius: 8 }}
          expandIconPosition="end"
        />
      </div>
    </AppLayout>
  );
};
