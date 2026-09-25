import { Text, View } from 'react-native';
import { PasswordField } from '@/components/ui/PasswordField';
import type { CadastroFormData, CadastroFormErrors } from '@/types/cadastro';
import { styles } from './cadastroStepStyles';

type CadastroStepSenhaProps = {
  data: Pick<CadastroFormData, 'senha' | 'confirmarSenha'>;
  errors: CadastroFormErrors;
  onChange: <K extends keyof CadastroFormData>(field: K, value: CadastroFormData[K]) => void;
  onTouch: (field: keyof CadastroFormData) => void;
};

export function CadastroStepSenha({ data, errors, onChange, onTouch }: CadastroStepSenhaProps) {
  return (
    <View>
      <Text style={styles.title}>Senha</Text>
      <Text style={styles.subtitle}>Deve conter letras, números e símbolos.</Text>

      <View style={styles.fields}>
        <PasswordField
          placeholder="Senha"
          value={data.senha}
          onChangeText={(value) => onChange('senha', value)}
          onBlur={() => onTouch('senha')}
          error={errors.senha}
          showToggle={true}
        />
        <PasswordField
          placeholder="Confirme a senha"
          value={data.confirmarSenha}
          onChangeText={(value) => onChange('confirmarSenha', value)}
          onBlur={() => onTouch('confirmarSenha')}
          error={errors.confirmarSenha}
          showToggle={false}
        />
      </View>
    </View>
  );
}
