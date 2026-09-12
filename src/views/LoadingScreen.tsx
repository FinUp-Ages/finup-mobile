import { View, Image, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoadingScreenViewModel } from '@/viewmodels/useLoadingScreenViewModel';

export default function LoadingScreen() {
  useLoadingScreenViewModel();

  return (
    <View style={{ flex: 1 }}>
      <Svg
        height="100%"
        width="100%"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Defs>
          <RadialGradient
            id="grad"
            cx="50%"
            cy="100%"
            rx="110%"
            ry="70%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#1C93D7" stopOpacity="1" />
            <Stop offset="1" stopColor="#021736" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      <SafeAreaView style={styles.safeArea}>
        <Image
          source={require('../../assets/finup-text-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 225,
    height: 78.5,
  },
});