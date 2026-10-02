import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppleIcon } from '@/components/ui/AppleIcon';
import { BrandGradient } from '@/components/ui/BrandGradient';
import { CurrencyField } from '@/components/ui/CurrencyField';
import { PillButton } from '@/components/ui/PillButton';
import { ChipOptions, PillSelect } from '@/components/ui/PillSelect';
import { colors } from '@/theme/colors';
import type { TransactionType } from '@/types/transaction';
import { formatAmount } from '@/utils/masks';
import { useTransactionModalViewModel } from '@/viewmodels/useTransactionModalViewModel';

/**
 * COMPONENT - modal de registro de transacao (mockup "Adicionar transacao").
 *
 * Camada opaca, com o mesmo degrade da tela, que cobre so a area da tela que a
 * renderiza (a barra de abas continua visivel, como no mockup). Quem usa coloca
 * o componente como ultimo filho da tela, controla `visible`/`onClose`, informa
 * o saldo exibido no cartao, o `type` (o botao Entrada ou Saida que abriu: so
 * aparecem o botao de salvar e as categorias desse tipo) e opcionalmente reage
 * ao sucesso via `onSuccess`.
 * Valor, pagamento, categoria e os botoes de salvar ficam juntos no mesmo
 * cartao (no mockup os botoes ficavam no rodape, longe do formulario).
 *
 * Nao existe uma rota propria pra isto, conforme a issue pede. Nao e um
 * <Modal> do React Native porque ele cobriria tambem a barra de abas; o botao
 * voltar do Android fecha a camada.
 */
type TransactionModalProps = {
  visible: boolean;
  type: TransactionType;
  balance: number | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function TransactionModal({
  visible,
  type,
  balance,
  onClose,
  onSuccess,
}: TransactionModalProps) {
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  // So monta o conteudo enquanto visivel: cada abertura e um mount novo, entao o
  // formulario nasce limpo sem precisar de logica de reset.
  if (!visible) return null;
  return (
    <TransactionModalContent
      balance={balance}
      onClose={onClose}
      onSuccess={onSuccess}
      type={type}
    />
  );
}

type TransactionModalContentProps = Omit<TransactionModalProps, 'visible'>;

function TransactionModalContent({
  type,
  balance,
  onClose,
  onSuccess,
}: TransactionModalContentProps) {
  const insets = useSafeAreaInsets();
  const {
    amount,
    setAmount,
    categoryId,
    setCategoryId,
    paymentMethodId,
    setPaymentMethodId,
    categories,
    paymentMethods,
    loading,
    loadError,
    errors,
    canSubmit,
    submitting,
    submitError,
    touchAmount,
    touchCategory,
    submit,
  } = useTransactionModalViewModel({ type, onClose, onSuccess });
  const isIncome = type === 'INCOME';

  // Qual pilula esta com a lista aberta (estado so visual, uma por vez).
  const [openPicker, setOpenPicker] = useState<'payment' | 'category' | null>(null);
  const selectedPaymentMethod = paymentMethods.find((item) => item.id === paymentMethodId);
  const selectedCategory = categories.find((item) => item.id === categoryId);

  function closeCategoryPicker() {
    setOpenPicker(null);
    touchCategory();
  }

  function togglePicker(picker: 'payment' | 'category') {
    Keyboard.dismiss();
    if (openPicker === 'category') touchCategory();
    setOpenPicker(openPicker === picker ? null : picker);
  }

  return (
    <View accessibilityViewIsModal style={StyleSheet.absoluteFill}>
      <BrandGradient />
      {/* Mesmo padrao das outras telas (Login, Cadastro): padding so no iOS; no
          Android a tela da aba ja e redimensionada quando o teclado abre. O
          cartao fica centralizado na area que sobra, com os botoes dentro dele. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.content, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.cardArea}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.balanceLabel}>Saldo total:</Text>
                <Text selectable style={styles.balanceValue}>
                  {balance === null ? '—' : formatAmount(balance)}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                hitSlop={10}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed ? styles.closeButtonPressed : null,
                ]}
              >
                <Feather color={colors.textPrimary} name="x" size={16} />
              </Pressable>
            </View>

            <CurrencyField
              error={errors.amount}
              onChange={setAmount}
              onTouch={touchAmount}
              placeholder="R$ 0,00"
              value={amount}
              variant="hero"
            />

            <View style={styles.pillsRow}>
              <PillSelect
                icon={
                  selectedPaymentMethod?.name.toLowerCase() === 'apple pay' ? (
                    <AppleIcon color={colors.white} size={14} />
                  ) : undefined
                }
                label="Pagamento"
                loading={loading}
                onPress={() => togglePicker('payment')}
                open={openPicker === 'payment'}
                selectedLabel={selectedPaymentMethod?.name}
              />
              <PillSelect
                error={Boolean(errors.category)}
                label="Categoria"
                loading={loading}
                onPress={() => togglePicker('category')}
                open={openPicker === 'category'}
                selectedLabel={selectedCategory?.name}
              />
            </View>

            {/* As opcoes abrem aqui, dentro do cartao, e nao por cima do formulario. */}
            {openPicker === 'payment' ? (
              <ChipOptions
                emptyMessage="Nenhum método de pagamento cadastrado."
                onSelect={(value) => {
                  // Opcional: tocar no selecionado de novo desmarca.
                  setPaymentMethodId(value === paymentMethodId ? null : value);
                  setOpenPicker(null);
                }}
                options={paymentMethods.map((paymentMethod) => ({
                  value: paymentMethod.id,
                  label: paymentMethod.name,
                }))}
                value={paymentMethodId}
              />
            ) : null}
            {openPicker === 'category' ? (
              <ChipOptions
                emptyMessage="Nenhuma categoria disponível."
                onSelect={(value) => {
                  setCategoryId(value);
                  closeCategoryPicker();
                }}
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                value={categoryId}
              />
            ) : null}

            {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

            {/* Sempre claro: e a unica acao do cartao e precisa de contraste maximo
                sobre o fundo translucido; o tipo fica no texto e no icone. */}
            <View style={styles.actions}>
              <PillButton
                disabled={!canSubmit}
                icon={isIncome ? 'plus' : 'minus'}
                label={isIncome ? 'Salvar entrada' : 'Salvar saída'}
                loading={submitting}
                onPress={submit}
                variant="light"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
    marginTop: 4,
  },
  balanceLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  balanceValue: {
    color: colors.white,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // 32 de diametro + hitSlop 10 = area de toque de 52 (minimo 44/48).
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.errorOnDark,
    fontSize: 13,
    textAlign: 'center',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
