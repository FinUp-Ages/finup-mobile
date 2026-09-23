import { Feather } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';

/**
 * COMPONENT - campo de data hibrido: digitacao manual (DD/MM/AAAA, com mascara
 * automatica) OU selecao pelo icone de calendario - as duas formas escrevem no
 * mesmo valor. O icone alterna (toggle): clicar abre, clicar de novo fecha.
 *
 * `value`/`onChange` trafegam como string ISO "AAAA-MM-DD" (mesmo formato que o
 * backend espera para BirthDate). So e propagado pra cima quando o texto forma
 * uma data completa, real e nao-futura; enquanto o usuario ainda esta digitando
 * (data incompleta), o texto fica so no estado local do componente.
 */
type DateFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
  placeholder: string;
  error?: string | boolean;
  maximumDate?: Date;
  onTouch?: () => void;
};

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join('/');
}

function parseCompleteDate(masked: string, maximumDate?: Date): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(masked);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isRealDate =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);
  if (!isRealDate) return null;
  if (maximumDate && date.getTime() > maximumDate.getTime()) return null;
  return toIsoDate(date);
}

export function DateField({
  value,
  onChange,
  placeholder,
  error,
  maximumDate,
  onTouch,
}: DateFieldProps) {
  const [text, setText] = useState(value ? formatBr(value) : '');
  const [open, setOpen] = useState(false);
  const hasError = Boolean(error);
  const message = typeof error === 'string' ? error : undefined;

  // Guarda o ultimo valor que o proprio componente emitiu (digitando ou pelo
  // calendario). Sem isso, o efeito abaixo nao consegue distinguir "o valor
  // mudou porque eu mesmo mandei" de "o valor mudou por fora" - e tratava os
  // dois casos igual, sobrescrevendo o texto que a pessoa estava digitando
  // sempre que uma data incompleta zerava o valor oficial.
  const lastEmitted = useRef(value);

  function emitChange(nextValue: string) {
    lastEmitted.current = nextValue;
    onChange(nextValue);
  }

  // Mantem o texto exibido sincronizado quando o valor muda por fora (ex.:
  // reset do formulario feito pelo pai) - nao roda quando a mudanca veio da
  // digitacao ou do calendario deste proprio componente.
  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    setText(value ? formatBr(value) : '');
  }, [value]);

  // Fecha o calendario quando QUALQUER outro campo da tela ganha foco (o
  // teclado abrindo e o sinal disso, mesmo sem esse campo saber quais outros
  // campos existem) - evita calendario e teclado disputando espaco na tela.
  useEffect(() => {
    if (!open) return;
    const subscription = Keyboard.addListener('keyboardDidShow', () => setOpen(false));
    return () => subscription.remove();
  }, [open]);

  function handleTextChange(raw: string) {
    const masked = maskDateInput(raw);
    setText(masked);
    const parsed = parseCompleteDate(masked, maximumDate);
    emitChange(parsed ?? '');
  }

  function toggleCalendar() {
    if (open) {
      setOpen(false);
      return;
    }
    // Sem isso, teclado (de digitacao manual) e calendario aparecem juntos e
    // disputam espaco na tela - era exatamente o bug de layout reportado.
    Keyboard.dismiss();
    setOpen(true);
  }

  function handlePickerChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setOpen(false);
      onTouch?.();
    }
    if (event.type === 'dismissed' || !date) return;
    const iso = toIsoDate(date);
    setText(formatBr(iso));
    emitChange(iso);
  }

  function handleConfirm() {
    setOpen(false);
    onTouch?.();
  }

  const pickerValue = value ? new Date(`${value}T00:00:00`) : new Date(2000, 0, 1);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.inputRow, hasError ? styles.inputError : null]}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={text}
          onChangeText={handleTextChange}
          onFocus={() => open && setOpen(false)}
          onBlur={onTouch}
          keyboardType="number-pad"
          maxLength={10}
          style={styles.input}
        />
        <Pressable hitSlop={8} onPress={toggleCalendar}>
          <Feather name="calendar" size={18} color={colors.icon} />
        </Pressable>
      </View>
      {message ? <Text style={styles.errorText}>{message}</Text> : null}

      {open ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          locale="pt_BR"
          maximumDate={maximumDate}
          onChange={handlePickerChange}
        />
      ) : null}

      {open && Platform.OS === 'ios' ? (
        <Pressable onPress={handleConfirm} style={styles.confirmButton}>
          <Text style={styles.confirmLabel}>Confirmar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  confirmLabel: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
  },
  wrapper: {
    marginBottom: 20,
  },
});
