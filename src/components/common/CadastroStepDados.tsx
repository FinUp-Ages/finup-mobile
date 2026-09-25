import { Text, View } from 'react-native';
import { TextField } from '@/components/ui/TextField';
import type { CadastroFormData, CadastroFormErrors } from '@/types/cadastro';
import { styles } from './cadastroStepStyles';

/**
 * COMPONENT - campos da Etapa 1 (Dados cadastrais).
 *
 * `celular` nao tem correspondencia na modelagem atual do backend - aparece aqui
 * so para bater com o Figma, mas nao e enviado em nenhum envio (ver cadastroModel).
 *
 * `onTouch` marca o campo como "tocado" ao perder o foco - so a partir dai o
 * erro daquele campo aparece (ver useCadastroViewModel).
 */
type CadastroStepDadosProps = {
  data: Pick<CadastroFormData, 'nome' | 'sobrenome' | 'email' | 'celular'>;
  errors: CadastroFormErrors;
  onChange: <K extends keyof CadastroFormData>(field: K, value: CadastroFormData[K]) => void;
  onTouch: (field: keyof CadastroFormData) => void;
};

export function CadastroStepDados({ data, errors, onChange, onTouch }: CadastroStepDadosProps) {
  return (
    <View>
      <Text style={styles.title}>Cadastro</Text>
      <Text style={styles.subtitle}>Preencha com seus dados legais</Text>

      <View style={styles.fields}>
        <TextField
          placeholder="Nome"
          value={data.nome}
          onChangeText={(value) => onChange('nome', value)}
          onBlur={() => onTouch('nome')}
          error={errors.nome}
          autoCapitalize="words"
        />
        <TextField
          placeholder="Sobrenome"
          value={data.sobrenome}
          onChangeText={(value) => onChange('sobrenome', value)}
          onBlur={() => onTouch('sobrenome')}
          error={errors.sobrenome}
          autoCapitalize="words"
        />
        <TextField
          placeholder="E-mail"
          value={data.email}
          onChangeText={(value) => onChange('email', value)}
          onBlur={() => onTouch('email')}
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          placeholder="Celular"
          value={data.celular}
          onChangeText={(value) => onChange('celular', value)}
          onBlur={() => onTouch('celular')}
          error={errors.celular}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}
