import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { colors } from '@/theme/colors';

/**
 * ROTA - layout do grupo (tabs): barra de abas nativa do mockup (Carteira,
 * Analise, Transacao, Educacional, Chatbot).
 *
 * NativeTabs usa a barra da plataforma: vidro (liquid glass) no iOS 26 e
 * Material 3 no Android. Icones: SF Symbols no iOS (`sf`) e Material Icons do
 * @expo/vector-icons no Android (`src`), que ja e dependencia do projeto - o
 * `md` usaria o expo-symbols, que so chega aqui como dependencia interna do
 * expo-router.
 * Abas nativas nao desenham cabecalho; as telas cuidam do proprio topo.
 *
 * Os parenteses fazem de "(tabs)" um grupo: as rotas respondem em "/carteira",
 * "/analise", "/transacao", "/educacional" e "/chatbot". Perfil e Transcricao
 * ficam fora da barra, como rotas da pilha raiz (app/_layout.tsx).
 */
export default function TabsLayout() {
  return (
    <NativeTabs indicatorColor={colors.tabIndicator} tintColor={colors.tabActive}>
      <NativeTabs.Trigger disableTransparentOnScrollEdge name="carteira">
        <NativeTabs.Trigger.Icon
          sf="dollarsign.circle.fill"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="monetization-on" />}
        />
        <NativeTabs.Trigger.Label>Carteira</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableTransparentOnScrollEdge name="analise">
        <NativeTabs.Trigger.Icon
          sf="chart.bar.fill"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="bar-chart" />}
        />
        <NativeTabs.Trigger.Label>Análise</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableTransparentOnScrollEdge name="transacao">
        <NativeTabs.Trigger.Icon
          sf="plus.circle.fill"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="add-circle" />}
        />
        <NativeTabs.Trigger.Label>Transação</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableTransparentOnScrollEdge name="educacional">
        <NativeTabs.Trigger.Icon
          sf="book.fill"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="menu-book" />}
        />
        <NativeTabs.Trigger.Label>Educacional</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger disableTransparentOnScrollEdge name="chatbot">
        <NativeTabs.Trigger.Icon
          sf="person.fill"
          src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="person" />}
        />
        <NativeTabs.Trigger.Label>Chatbot</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
