import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/AppText';
import { BrandGradient } from '@/components/ui/BrandGradient';
import { ChipOptions, PillSelect } from '@/components/ui/PillSelect';
import { colors, darkColors } from '@/theme/colors';
import type { AnaliseMovement } from '@/types/analise';
import { useEditExpenseCategoryViewModel } from '@/viewmodels/useEditExpenseCategoryViewModel';

type Props = { movement: AnaliseMovement; onClose: () => void };

export function EditExpenseCategoryModal({ movement, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const vm = useEditExpenseCategoryViewModel({ movement, onClose });
  const { close } = vm;
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => subscription.remove();
  }, [close]);

  return (
    <View accessibilityViewIsModal style={StyleSheet.absoluteFill}>
      <BrandGradient />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              Editar categoria
            </Text>
            <Pressable
              accessibilityLabel="Fechar edição de categoria"
              accessibilityRole="button"
              accessibilityState={{ disabled: vm.submitting }}
              disabled={vm.submitting}
              hitSlop={10}
              onPress={vm.close}
              style={styles.close}
            >
              <Feather color={colors.navy} name="x" size={20} />
            </Pressable>
          </View>
          <Text style={styles.expenseTitle}>{movement.title}</Text>
          <Text style={styles.amount}>{movement.amount}</Text>
          <Text style={styles.detail}>
            {movement.date} • Categoria atual: {movement.categoryName}
          </Text>

          {vm.loading ? (
            <ActivityIndicator accessibilityLabel="Carregando categorias" color={colors.white} />
          ) : vm.loadError ? (
            <View accessibilityLiveRegion="polite" style={styles.feedback}>
              <Text style={styles.error}>{vm.loadError}</Text>
              <Pressable accessibilityRole="button" onPress={vm.retry} style={styles.secondary}>
                <Text style={styles.secondaryLabel}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : vm.categories.length === 0 ? (
            <Text style={styles.detail}>Nenhuma categoria de saída disponível.</Text>
          ) : (
            <View pointerEvents={vm.submitting ? 'none' : 'auto'} style={styles.categoryPicker}>
              <PillSelect
                label="Categoria"
                onPress={() => setPickerOpen((open) => !open)}
                open={pickerOpen}
                selectedLabel={vm.selectedCategory?.name ?? movement.categoryName}
              />
              {pickerOpen ? (
                <ChipOptions
                  emptyMessage="Nenhuma categoria de saída disponível."
                  onSelect={(id) => {
                    vm.selectCategory(id);
                    setPickerOpen(false);
                  }}
                  options={vm.categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                  value={vm.categoryId}
                />
              ) : null}
            </View>
          )}
          {vm.submitError ? (
            <Text accessibilityLiveRegion="assertive" style={styles.error}>
              {vm.submitError}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !vm.canSave, busy: vm.submitting }}
            disabled={!vm.canSave}
            onPress={vm.save}
            style={({ pressed }) => [
              styles.save,
              !vm.canSave && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            {vm.submitting ? <ActivityIndicator color={colors.navy} /> : null}
            <Text style={styles.saveLabel}>{vm.submitting ? 'Salvando…' : 'Salvar categoria'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: vm.submitting }}
            disabled={vm.submitting}
            onPress={vm.close}
            style={styles.secondary}
          >
            <Text style={styles.secondaryLabel}>Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: colors.glassSoft, borderRadius: 20, padding: 24, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { color: colors.white, fontSize: 20, fontWeight: '700', flex: 1 },
  close: { backgroundColor: colors.white, borderRadius: 20, padding: 10 },
  expenseTitle: { color: darkColors.textPrimary, fontSize: 17, fontWeight: '600' },
  amount: { color: darkColors.expenseText, fontSize: 26, fontWeight: '700' },
  detail: { color: darkColors.textMuted, fontSize: 14, lineHeight: 21 },
  feedback: { gap: 12 },
  categoryPicker: { gap: 12 },
  error: { color: colors.errorOnDark, fontSize: 14, lineHeight: 21 },
  save: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  saveLabel: { color: colors.navy, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  secondary: { padding: 12, alignItems: 'center' },
  secondaryLabel: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
