import { Text, View } from 'react-native';
import { DateField } from '@/components/ui/DateField';
import { TextField } from '@/components/ui/TextField';
import type { CadastroFormData, CadastroFormErrors } from '@/types/cadastro';
import { styles } from './cadastroStepStyles';

/**
 * COMPONENT - campos da Etapa 2 (Dados adicionais).
 *
 * `birthDate` -> Users.BirthDate, `monthlyIncome` -> Users.MonthlyIncome: existem
 * na modelagem atual. `profissao` NAO existe em nenhuma tabela documentada -
 * aparece so para bater com o Figma, e nao e enviada em nenhum envio (ver
 * cadastroModel).
 */
type CadastroStepAdicionaisProps = {
  data: Pick<CadastroFormData, 'birthDate' | 'monthlyIncome' | 'profissao'>;
  errors: CadastroFormErrors;
  onChange: <K extends keyof CadastroFormData>(field: K, value: CadastroFormData[K]) => void;
  onTouch: (field: keyof CadastroFormData) => void;
};

export function CadastroStepAdicionais({
  data,
  errors,
  onChange,
  onTouch,
}: CadastroStepAdicionaisProps) {
  return (
    <View>
      <Text style={styles.title}>Dados adicionais</Text>
      <Text style={styles.subtitle}>Dados para traçar seu perfil financeiro</Text>

      <View style={styles.fields}>
        <DateField
          placeholder="Data de nascimento (DD/MM/AAAA)"
          value={data.birthDate}
          onChange={(isoDate) => onChange('birthDate', isoDate)}
          onTouch={() => onTouch('birthDate')}
          error={errors.birthDate}
          maximumDate={new Date()}
        />
        <TextField
          placeholder="Renda fixa mensal"
          value={data.monthlyIncome}
          onChangeText={(value) => onChange('monthlyIncome', value)}
          onBlur={() => onTouch('monthlyIncome')}
          error={errors.monthlyIncome}
          keyboardType="decimal-pad"
        />
        <TextField
          placeholder="Profissão"
          value={data.profissao}
          onChangeText={(value) => onChange('profissao', value)}
          onBlur={() => onTouch('profissao')}
          error={errors.profissao}
        />
      </View>
    </View>
  );
}
