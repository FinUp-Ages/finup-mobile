import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

const DEFAULT_OPTIONS = [
  'CLT / Carteira assinada',
  'Autônomo / PJ',
  'Profissional liberal',
  'Servidor público',
  'Empresário / Empreendedor',
  'Estudante',
  'Aposentado / Pensionista',
  'Outro',
];

type SelectFieldProps = {
  placeholder: string;
  value: string;
  options?: string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | boolean;
};

export function SelectField({
  placeholder,
  value,
  options = DEFAULT_OPTIONS,
  onChange,
  onBlur,
  error,
}: SelectFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const hasError = Boolean(error);
  const message = typeof error === 'string' ? error : undefined;

  function handleSelect(option: string) {
    if (option === 'Outro') {
      setIsCustom(true);
      setCustomValue('');
    } else {
      onChange(option);
      setModalVisible(false);
      setIsCustom(false);
      onBlur?.();
    }
  }

  function handleCustomConfirm() {
    if (customValue.trim()) {
      onChange(customValue.trim());
    }
    setModalVisible(false);
    setIsCustom(false);
    onBlur?.();
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[styles.inputRow, hasError ? styles.inputError : null]}
      >
        <Text style={[styles.text, !value ? styles.placeholderText : null]}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.icon} />
      </Pressable>

      {message ? <Text style={styles.errorText}>{message}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setIsCustom(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setModalVisible(false);
              setIsCustom(false);
            }}
          />
          <SafeAreaView edges={['bottom']} style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{placeholder}</Text>

            {isCustom ? (
              <View style={styles.customContainer}>
                <TextInput
                  placeholder="Digite sua profissão"
                  placeholderTextColor={colors.placeholder}
                  value={customValue}
                  onChangeText={setCustomValue}
                  autoFocus
                  style={styles.customInput}
                />
                <View style={styles.customButtons}>
                  <Pressable
                    onPress={() => setIsCustom(false)}
                    style={[styles.customBtn, styles.cancelBtn]}
                  >
                    <Text style={styles.cancelBtnText}>Voltar</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCustomConfirm}
                    style={[styles.customBtn, styles.confirmBtn]}
                  >
                    <Text style={styles.confirmBtnText}>Confirmar</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = item === value;
                  return (
                    <Pressable
                      style={[styles.optionItem, isSelected ? styles.optionSelected : null]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item}
                      </Text>
                      {isSelected ? (
                        <Feather name="check" size={18} color={colors.textPrimary} />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cancelBtn: {
    backgroundColor: '#E2E8F0',
  },
  cancelBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: colors.textPrimary,
  },
  confirmBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
  customBtn: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 12,
  },
  customButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  customContainer: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  customInput: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
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
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 20,
    paddingTop: 12,
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    height: 4,
    marginBottom: 16,
    width: 40,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionItem: {
    alignItems: 'center',
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  optionSelected: {
    backgroundColor: '#F8FAFC',
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  placeholderText: {
    color: colors.placeholder,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  wrapper: {
    marginBottom: 20,
  },
});