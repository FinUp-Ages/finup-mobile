import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native';
import { LearningBannerCard } from '@/components/home/LearningBannerCard';
import { ScoreBannerCard } from '@/components/home/ScoreBannerCard';
import type { HomeTriageStatus } from '@/viewmodels/useHomeBannerViewModel';

type BannerKey = 'score' | 'learning';

type HomeBannersProps = {
  onPressLearning: () => void;
  onPressScore: () => void;
  triage: HomeTriageStatus;
};

const ROTATE_INTERVAL_MS = 6000;
const FADE_MS = 280;

/**
 * Banner da Home. Triagem respondida: so o de aprendizado. Triagem pendente: alterna entre
 * o do score (que leva a triagem) e o de aprendizado, com pontinhos para trocar na mao.
 * Enquanto o estado da triagem e desconhecido, fica so o do score.
 *
 * Com "reduzir movimento" ligado nao ha troca automatica nem fade: so os pontinhos.
 */
export function HomeBanners({ onPressLearning, onPressScore, triage }: HomeBannersProps) {
  const banners: BannerKey[] =
    triage === 'completed' ? ['learning'] : triage === 'pending' ? ['score', 'learning'] : ['score'];
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [opacity] = useState(() => new Animated.Value(1));
  const firstRender = useRef(true);

  const current = banners[index % banners.length];
  const rotating = banners.length > 1;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  // Fade-in a cada troca (nao no primeiro desenho).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (reduceMotion) return;
    opacity.setValue(0);
    Animated.timing(opacity, { duration: FADE_MS, toValue: 1, useNativeDriver: true }).start();
  }, [current, opacity, reduceMotion]);

  // Troca automatica so com a Home em foco e sem "reduzir movimento".
  useFocusEffect(
    useCallback(() => {
      if (!rotating || reduceMotion) return undefined;
      const timer = setInterval(() => setIndex((value) => value + 1), ROTATE_INTERVAL_MS);
      return () => clearInterval(timer);
    }, [reduceMotion, rotating]),
  );

  return (
    <View>
      <Animated.View style={{ opacity }}>
        {current === 'learning' ? (
          <LearningBannerCard onPress={onPressLearning} />
        ) : (
          <ScoreBannerCard onPress={onPressScore} />
        )}
      </Animated.View>
      {rotating ? (
        <View style={styles.dots}>
          {banners.map((key, position) => {
            const selected = key === current;
            return (
              <Pressable
                accessibilityLabel={key === 'score' ? 'Banner do score' : 'Banner de aprendizado'}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                hitSlop={10}
                key={key}
                onPress={() => setIndex(position)}
                style={[styles.dot, selected ? styles.dotSelected : null]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dotSelected: {
    backgroundColor: '#ffffff',
    width: 16,
  },
  dots: {
    alignSelf: 'center',
    bottom: 8,
    flexDirection: 'row',
    gap: 6,
    position: 'absolute',
  },
});
