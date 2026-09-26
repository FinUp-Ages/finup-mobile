import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CadastroHeader } from '@/components/common/CadastroHeader';
import { AppleIcon } from '@/components/ui/AppleIcon';
import { CurrencyField } from '@/components/ui/CurrencyField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SelectField } from '@/components/ui/SelectField';
import { colors } from '@/theme/colors';
import { useTransactionModalViewModel } from '@/viewmodels/useTransactionModalViewModel';

/**
 * COMPONENT - bottom sheet de registro de transacao.
 *
 * Reutilizavel por qualquer tela (hoje so a AnaliseScreen usa; a Home podera
 * plugar depois sem mudar nada aqui): quem abre controla `visible`/`onClose`
 * e opcionalmente reage ao sucesso via `onSuccess` (ex.: atualizar saldo).
 *
 * Nao existe uma rota propria pra isto - e sempre um Modal por cima da tela
 * atual, conforme a issue pede.
 */
type TransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function TransactionModal({ visible, onClose, onSuccess }: TransactionModalProps) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.container}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        {/* So monta o conteudo enquanto visivel: cada abertura e um mount novo,
            entao o formulario nasce limpo sem precisar de logica de reset. */}
        {visible ? <TransactionModalContent onClose={onClose} onSuccess={onSuccess} /> : null}
      </View>
    </Modal>
  );
}

type TransactionModalContentProps = {
  onClose: () => void;
  onSuccess?: () => void;
};

function TransactionModalContent({ onClose, onSuccess }: TransactionModalContentProps) {
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
    submittingType,
    submitError,
    touchAmount,
    touchCategory,
    submit,
  } = useTransactionModalViewModel({ onClose, onSuccess });

  return (
    <SafeAreaView edges={['bottom']} style={styles.sheet}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <CadastroHeader onClose={onClose} title="Nova transação" />

        {loadError ? <Text style={styles.loadError}>{loadError}</Text> : null}

        <View style={styles.form}>
          <CurrencyField
            error={errors.amount}
            onChange={setAmount}
            onTouch={touchAmount}
            placeholder="R$ 0,00"
            value={amount}
          />

          <SelectField
            error={errors.category}
            loading={loading}
            onChange={setCategoryId}
            onTouch={touchCategory}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
            placeholder="Categoria"
            value={categoryId}
          />

          <SelectField
            loading={loading}
            onChange={setPaymentMethodId}
            options={paymentMethods.map((paymentMethod) => ({
              value: paymentMethod.id,
              label: paymentMethod.name,
              icon:
                paymentMethod.id === 'mock-apple-pay' ? (
                  <AppleIcon color={colors.icon} size={16} />
                ) : undefined,
            }))}
            placeholder="Método de pagamento (opcional)"
            value={paymentMethodId}
          />
        </View>

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <View style={styles.actionsRow}>
          <View style={styles.actionSlot}>
            <PrimaryButton
              disabled={!canSubmit}
              icon="save"
              label="Salvar entrada"
              loading={submitting && submittingType === 'INCOME'}
              onPress={() => submit('INCOME')}
            />
          </View>
          <View style={styles.actionSlot}>
            <PrimaryButton
              disabled={!canSubmit}
              icon="save"
              label="Salvar saída"
              loading={submitting && submittingType === 'EXPENSE'}
              onPress={() => submit('EXPENSE')}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionSlot: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backdrop: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  form: {
    marginTop: 20,
  },
  loadError: {
    color: colors.error,
    fontSize: 13,
    marginTop: 16,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  submitError: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
  },
});
