/// <reference types="jest" />
import { fireEvent, render } from '@testing-library/react-native';
import type { DeviceSpeechSupport } from '@/types/speech';
import { DeviceSupportCard } from './DeviceSupportCard';

test('mostra capacidade indisponível e oferece baixar modelo', async () => {
  const onDownloadModel = jest.fn();
  const props = { onDevicePackage: 'Pacote', locale: 'pt-BR', onDownloadModel };
  const screen = await render(<DeviceSupportCard {...props} support={null} loading />);
  expect(screen.getByText('Lendo as capacidades do aparelho...')).toBeTruthy();
  const support: DeviceSpeechSupport = { onDeviceSupported: true, hasOfflineLocale: false, recognitionAvailable: true, hasOnDevicePackage: true, defaultService: '', services: [], installedLocales: [] };
  await screen.rerender(<DeviceSupportCard {...props} support={support} loading={false} />);
  expect(screen.getByText('offline não confirmado')).toBeTruthy();
  await fireEvent.press(screen.getByText('Baixar modelo offline de pt-BR'));
  expect(onDownloadModel).toHaveBeenCalledTimes(1);
});
