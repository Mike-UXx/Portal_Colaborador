import React from 'react';
import { Typography, App as AntApp } from 'antd';
import { AppLayout } from '../../components/Layout/AppLayout';
import { BackLink } from '../../components/BackLink';
import { SectionCard, PendingRow, StatusTag } from '../../components/home';
import { MOCK_SURVEYS } from '../../mocks/data';
import { COLORS } from '../../theme/tokens';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const { Title } = Typography;

export const SurveysPage: React.FC = () => {
  const { message } = AntApp.useApp();
  const pending = MOCK_SURVEYS.filter(s => s.status === 'pending');

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <BackLink />
          <Title level={3} style={{ margin: 0, color: COLORS.primary, fontWeight: 600 }}>
            Pesquisas
          </Title>
        </div>

        <SectionCard title="Pesquisas pendentes" count={pending.length} emptyText="Nenhuma pesquisa pendente">
          {pending.map((s, i) => (
            <PendingRow
              key={s.id}
              tag={<StatusTag preset="warning">Resposta pendente</StatusTag>}
              title={s.title}
              meta={`Prazo: ${dayjs(s.deadline).format('DD/MM/YYYY')} · ~${s.estimatedMinutes} min`}
              actionLabel="Responder"
              onAction={() => message.info('Este fluxo será criado em uma versão futura.')}
              last={i === pending.length - 1}
            />
          ))}
        </SectionCard>
      </div>
    </AppLayout>
  );
};
