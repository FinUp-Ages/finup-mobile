/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import type { AssessmentResponse } from '@/types/triage';
import { TriageAssessment } from './TriageAssessment';

const result: AssessmentResponse = { completedAt: '2026-01-02T12:00:00Z', assessment: { profile: 'MODERATE', summary: 'Resumo financeiro', risks: [] } };

test('mostra perfil e ausência de pontos de atenção', async () => {
  const screen = await render(<TriageAssessment result={result} />);
  expect(screen.getByText('Moderado')).toBeTruthy();
  expect(screen.getByText('Resumo financeiro')).toBeTruthy();
  expect(screen.getByText('Nenhum ponto de atenção identificado.')).toBeTruthy();
});

test('apresenta prioridade e sugestão de cada risco', async () => {
  const screen = await render(<TriageAssessment result={{ ...result, assessment: { ...result.assessment, risks: [{ code: 'r', severity: 'HIGH', title: 'Reserva', description: 'Risco de emergência', suggestion: 'Crie uma reserva' }] } }} />);
  expect(screen.getByText('Prioridade alta')).toBeTruthy();
  expect(screen.getByText('Crie uma reserva')).toBeTruthy();
});
