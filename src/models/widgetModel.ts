import { authModel } from '@/models/authModel';
import { transactionModel } from '@/models/transactionModel';
import { userModel } from '@/models/userModel';
import { todayIsoDate } from '@/utils/dates';
import { firstName } from '@/utils/format';
import {
  buildWidgetContent,
  monthStartIsoDate,
  summarizeExpenses,
  type WidgetContent,
} from '@/utils/widgetContent';

/**
 * MODEL - dados do widget da tela inicial (src/widgets): nome e gastos do dia e do
 * mes do usuario logado.
 *
 * Roda tanto com o app aberto quanto em segundo plano (headless JS, quando o
 * Android pede para redesenhar o widget). Sem sessao ou com falha de rede, o
 * widget mostra so saudacao e dica, sem travar nem mostrar erro.
 */
export const widgetModel = {
  loadContent: async (now: Date = new Date()): Promise<WidgetContent> => {
    try {
      if (!(await authModel.hasSession())) return buildWidgetContent(now, null);

      const today = todayIsoDate(now);
      const [user, month] = await Promise.all([
        userModel.getMe(),
        transactionModel.list(monthStartIsoDate(now), today),
      ]);
      return buildWidgetContent(now, {
        // O back pode devolver name nulo (usuario sem nome no Cognito).
        name: user.name ? firstName(user.name) : null,
        summary: summarizeExpenses(month.transactions, today),
      });
    } catch (error) {
      if (__DEV__) console.warn('[widget] sem dados do usuario; mostrando so saudacao.', error);
      return buildWidgetContent(now, null);
    }
  },
};
