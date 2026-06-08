import React from 'react';
import { Typography, App as AntApp } from 'antd';
import { AppLayout } from '../../components/Layout/AppLayout';
import { BackLink } from '../../components/BackLink';
import { SectionCard, PendingRow, StatusTag } from '../../components/home';
import { MOCK_TRAININGS } from '../../mocks/data';
import { COLORS } from '../../theme/tokens';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const { Title } = Typography;

export const TrainingsPage: React.FC = () => {
  const { message } = AntApp.useApp();
  const pending = MOCK_TRAININGS.filter(t => t.status === 'pending');

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <BackLink />
          <Title level={3} style={{ margin: 0, color: COLORS.primary, fontWeight: 600 }}>
            Treinamentos
          </Title>
        </div>

        <SectionCard title="Treinamentos pendentes" count={pending.length} emptyText="Nenhum treinamento pendente">
          {pending.map((t, i) => (
            <PendingRow
              key={t.id}
              tag={<StatusTag preset="warning">Visualização pendente</StatusTag>}
              title={t.title}
              meta={`Prazo: ${dayjs(t.deadline).format('DD/MM/YYYY')} · ${t.durationMinutes} min`}
              actionLabel="Assistir"
              onAction={() => message.info('Este fluxo será criado em uma versão futura.')}
              last={i === pending.length - 1}
            />
          ))}
        </SectionCard>
      </div>
    </AppLayout>
  );
};
