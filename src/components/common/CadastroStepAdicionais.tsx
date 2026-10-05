import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/AppText';
import { DateField } from '@/components/ui/DateField';
import { SelectField, type SelectOption } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { INCOME_RANGES, PROFESSIONS } from '@/utils/cadastroOptions';
import type { CadastroFormData, CadastroFormErrors } from '@/types/cadastro';
import { styles } from './cadastroStepStyles';

const PROFISSAO_OPTIONS: SelectOption<string>[] = PROFESSIONS.map((value) => ({
  value,
  label: value,
}));
const INCOME_OPTIONS: SelectOption<string>[] = INCOME_RANGES.map(({ value, label }) => ({
  value,
  label,
}));
const OTHER = 'Outra';

/**
 * COMPONENT - campos da Etapa 2 (Dados adicionais).
 *
 * `birthDate`, `monthlyIncome` (faixa escolhida num dropdown) e `profissao`
 * seguem para o PATCH /users/me/additional-info (ver cadastroModel).
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
  const isCustomInitial = Boolean(
    data.profissao &&
      !PROFISSAO_OPTIONS.some((opt) => opt.value !== OTHER && opt.value === data.profissao)
  );
  const [isOtherSelected, setIsOtherSelected] = useState(isCustomInitial);

  function handleSelectProfissao(selected: string) {
    if (selected === OTHER) {
      setIsOtherSelected(true);
      onChange('profissao', '');
    } else {
      setIsOtherSelected(false);
      onChange('profissao', selected);
    }
  }

  const selectValue = isOtherSelected
    ? OTHER
    : (PROFISSAO_OPTIONS.some((opt) => opt.value === data.profissao) ? data.profissao : null);

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
        <SelectField
          placeholder="Renda fixa mensal"
          value={data.monthlyIncome || null}
          options={INCOME_OPTIONS}
          onChange={(value) => onChange('monthlyIncome', value)}
          onTouch={() => onTouch('monthlyIncome')}
          error={errors.monthlyIncome}
        />
        <SelectField
          placeholder="Profissão"
          value={selectValue}
          options={PROFISSAO_OPTIONS}
          onChange={handleSelectProfissao}
          onTouch={() => onTouch('profissao')}
          error={!isOtherSelected ? errors.profissao : undefined}
        />
        {isOtherSelected ? (
          <TextField
            placeholder="Digite sua profissão"
            value={data.profissao}
            onChangeText={(value) => onChange('profissao', value)}
            onBlur={() => onTouch('profissao')}
            error={errors.profissao}
          />
        ) : null}
      </View>
    </View>
  );
}
