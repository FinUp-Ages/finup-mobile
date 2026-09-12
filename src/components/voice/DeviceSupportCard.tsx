import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ON_DEVICE_SERVICE_PACKAGE, SPEECH_LOCALE } from '@/constants/speech';
import type { DeviceSpeechSupport } from '@/types/speech';

type DeviceSupportCardProps = {
  support: DeviceSpeechSupport | null;
  isPreparing: boolean;
  onDownloadModel: () => void;
};

function Line({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <Text className="text-xs text-slate-500">{label}</Text>
      <Text
        className={[
          'flex-1 text-right text-xs font-medium',
          ok === undefined ? 'text-slate-700' : ok ? 'text-emerald-700' : 'text-amber-700',
        ].join(' ')}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Responde a pergunta central da POC antes de qualquer gravacao: este aparelho
 * transcreve sem internet?
 */
function DeviceSupportCardImpl({ support, isPreparing, onDownloadModel }: DeviceSupportCardProps) {
  if (isPreparing) {
    return (
      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-xs text-slate-500">Lendo as capacidades do aparelho...</Text>
      </View>
    );
  }

  if (!support) {
    return (
      <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <Text className="text-xs text-amber-800">
          Não foi possível ler as capacidades do aparelho. Em Expo Go isso é esperado: o
          reconhecimento é um módulo nativo e exige development build.
        </Text>
      </View>
    );
  }

  const offlineReady = support.onDeviceSupported && support.hasOfflineLocale;

  return (
    <View className="gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Aparelho
        </Text>
        <View
          className={[
            'rounded-full px-2 py-1',
            offlineReady ? 'bg-emerald-100' : 'bg-amber-100',
          ].join(' ')}
        >
          <Text
            className={[
              'text-[10px] font-bold uppercase',
              offlineReady ? 'text-emerald-800' : 'text-amber-800',
            ].join(' ')}
          >
            {offlineReady ? 'offline pronto' : 'offline não confirmado'}
          </Text>
        </View>
      </View>

      <Line
        label="Reconhecimento no aparelho"
        value={support.onDeviceSupported ? 'suportado' : 'não suportado'}
        ok={support.onDeviceSupported}
      />
      <Line
        label="Serviço de reconhecimento"
        value={support.recognitionAvailable ? 'disponível' : 'indisponível'}
        ok={support.recognitionAvailable}
      />
      <Line
        label={ON_DEVICE_SERVICE_PACKAGE}
        value={support.hasOnDevicePackage ? 'instalado' : 'ausente'}
        ok={support.hasOnDevicePackage}
      />
      <Line
        label={`Modelo offline ${SPEECH_LOCALE}`}
        value={support.hasOfflineLocale ? 'instalado' : 'não confirmado'}
        ok={support.hasOfflineLocale}
      />
      <Line label="Serviço padrão" value={support.defaultService || '—'} />
      <Line label="Serviços instalados" value={support.services.join(', ') || '—'} />

      {support.hasOfflineLocale ? null : (
        <Pressable onPress={onDownloadModel} hitSlop={8} accessibilityRole="button">
          <Text className="pt-1 text-xs font-semibold text-emerald-700">
            Baixar modelo offline de {SPEECH_LOCALE}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export const DeviceSupportCard = memo(DeviceSupportCardImpl);
