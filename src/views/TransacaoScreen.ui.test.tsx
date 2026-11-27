/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTransacaoViewModel } from '@/viewmodels/useTransacaoViewModel';
import TransacaoScreen from './TransacaoScreen';

jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: jest.fn() }) }));
jest.mock('@/viewmodels/useTransacaoViewModel', () => ({ useTransacaoViewModel: jest.fn() }));
jest.mock('@/components/common/TransactionModal', () => ({ TransactionModal: () => null }));
jest.mock('react-native-screens/experimental', () => ({ SafeAreaView: require('react-native').View }));

test('oferece nova tentativa de saldo e abre formulário de saída', async () => {
  const retryBalance = jest.fn(), openModal = jest.fn();
  jest.mocked(useTransacaoViewModel).mockReturnValue({ balance: { status: 'error' }, balanceValue: null, retryBalance, modalVisible: false, modalType: 'INCOME', openModal, closeModal: jest.fn(), onTransactionSaved: jest.fn() });
  const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 44, bottom: 34, left: 0, right: 0 } };
  const screen = await render(<SafeAreaProvider initialMetrics={metrics}><TransacaoScreen /></SafeAreaProvider>);
  expect(screen.getByText('Não foi possível carregar o saldo.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Tentar novamente'));
  await fireEvent.press(screen.getByText('Saída'));
  expect(retryBalance).toHaveBeenCalledTimes(1);
  expect(openModal).toHaveBeenCalledWith('EXPENSE');
});
