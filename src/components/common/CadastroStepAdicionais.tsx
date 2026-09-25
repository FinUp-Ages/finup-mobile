import { Text, View } from 'react-native';
import { DateField } from '@/components/ui/DateField';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import type { CadastroFormData, CadastroFormErrors } from '@/types/cadastro';
import { styles } from './cadastroStepStyles';

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
          placeholder="Data de nascimento"
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
        <SelectField
          placeholder="Profissão"
          value={data.profissao}
          onChange={(value) => onChange('profissao', value)}
          onBlur={() => onTouch('profissao')}
          error={errors.profissao}
        />
      </View>
    </View>
  );
}
