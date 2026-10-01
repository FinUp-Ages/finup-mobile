import { useState } from 'react';
import { Text, View } from 'react-native';
import { DateField } from '@/components/ui/DateField';
import { SelectField, type SelectOption } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import type { CadastroFormData, CadastroFormErrors } from '@/types/cadastro';
import { styles } from './cadastroStepStyles';

const PROFISSAO_OPTIONS: SelectOption<string>[] = [
  { value: 'CLT / Carteira assinada', label: 'CLT / Carteira assinada' },
  { value: 'Autônomo / PJ', label: 'Autônomo / PJ' },
  { value: 'Profissional liberal', label: 'Profissional liberal' },
  { value: 'Servidor público', label: 'Servidor público' },
  { value: 'Empresário / Empreendedor', label: 'Empresário / Empreendedor' },
  { value: 'Estudante', label: 'Estudante' },
  { value: 'Aposentado / Pensionista', label: 'Aposentado / Pensionista' },
  { value: 'Outro', label: 'Outro' },
];

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
  const isCustomInitial = Boolean(
    data.profissao &&
      !PROFISSAO_OPTIONS.some((opt) => opt.value !== 'Outro' && opt.value === data.profissao)
  );
  const [isOtherSelected, setIsOtherSelected] = useState(isCustomInitial);

  function handleSelectProfissao(selected: string) {
    if (selected === 'Outro') {
      setIsOtherSelected(true);
      onChange('profissao', '');
    } else {
      setIsOtherSelected(false);
      onChange('profissao', selected);
    }
  }

  const selectValue = isOtherSelected
    ? 'Outro'
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
        <TextField
          placeholder="Renda fixa mensal"
          value={data.monthlyIncome}
          onChangeText={(value) => onChange('monthlyIncome', value)}
          onBlur={() => onTouch('monthlyIncome')}
          error={errors.monthlyIncome}
          keyboardType="numeric"
          maxLength={18}
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
