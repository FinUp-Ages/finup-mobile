import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

type TabBarClearanceValue = {
  /** Altura que a barra de abas ocupa por cima do fundo da tela (0 com o teclado aberto). */
  height: number;
  setHeight: (height: number) => void;
};

const TabBarClearanceContext = createContext<TabBarClearanceValue>({
  height: 0,
  setHeight: () => {},
});

/**
 * A barra de abas flutua por cima das telas (nao ocupa espaco no layout). Quem a desenha avisa a
 * altura aqui, e cada tela usa `useTabBarClearance()` como folga no fim do conteudo.
 */
export function TabBarClearanceProvider({ children }: { children: ReactNode }) {
  const [height, setHeight] = useState(0);
  const value = useMemo(() => ({ height, setHeight }), [height]);
  return <TabBarClearanceContext.Provider value={value}>{children}</TabBarClearanceContext.Provider>;
}

/** Folga inferior para o conteudo das telas das abas: altura da barra flutuante, ja com o inset. */
export function useTabBarClearance(): number {
  return useContext(TabBarClearanceContext).height;
}

/** Usado so pela barra para informar a propria altura. */
export function useReportTabBarHeight(): (height: number) => void {
  return useContext(TabBarClearanceContext).setHeight;
}
