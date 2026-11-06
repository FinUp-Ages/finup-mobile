import { Asset } from 'expo-asset';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SvgCssUri } from 'react-native-svg/css';
import { Text } from '@/components/ui/AppText';
import { LearningButton } from '@/components/learning/LearningButton';
import { colors, learningColors } from '@/theme/colors';
import type { StudyLevel } from '@/types/studyTrack';

const levelUri = Asset.fromModule(require('../../../assets/learning/level.svg')).uri;
const starsUri = Asset.fromModule(require('../../../assets/learning/stars.svg')).uri;
const cloudLeft = Asset.fromModule(require('../../../assets/learning/cloud-left.svg')).uri;
const cloudRight = Asset.fromModule(require('../../../assets/learning/cloud-right.svg')).uri;
const positions = [60, 236, 112, 248, 93];
const xFor = (index: number) => positions[index % positions.length];

/** Geometria da trilha do Figma, adaptada a largura disponivel; nivel vem dos dados. */
export function LearningPath({
  levels,
  onOpen,
}: {
  levels: StudyLevel[];
  onOpen: (level: StudyLevel) => void;
}) {
  const { width } = useWindowDimensions();
  const scale = Math.min((width - 32) / 370, 1.25);
  const height = Math.max(130, (levels.length - 1) * 99 + 130);
  return (
    <View style={{ height: height * scale, alignSelf: 'center', width: 370 * scale }}>
      <View style={[styles.path, { height, transform: [{ scale }], transformOrigin: 'top left' }]}>
        <Svg width={370} height={height} style={StyleSheet.absoluteFill} accessible={false}>
          {levels.slice(0, -1).flatMap((level, index) => {
            const startX = xFor(index) - 16 + 39;
            const endX = xFor(index + 1) - 16 + 39;
            return Array.from({ length: 7 }, (_, dot) => {
              const t = (dot + 1) / 8;
              const x = startX + (endX - startX) * t;
              const y = index * 99 + 55 + t * 99 - Math.sin(t * Math.PI) * 25;
              return (
                <Circle
                  key={`${level.question.id}-${dot}`}
                  cx={x}
                  cy={y}
                  r={5.5}
                  fill={
                    levels[index + 1].reached ? learningColors.connector : learningColors.unreached
                  }
                />
              );
            });
          })}
        </Svg>
        {levels.map((level, index) => (
          <View
            key={level.question.id}
            style={[styles.slot, { left: xFor(index) - 16, top: index * 99 }]}
          >
            <LearningButton
              accessibilityLabel={`Nível ${level.number}, ${level.stars} de 3 estrelas${level.reached ? '' : ', ainda não alcançado'}`}
              accessibilityHint="Abre o conteúdo deste nível"
              onPress={() => onOpen(level)}
              style={styles.level}
            >
              <View pointerEvents="none" style={styles.art}>
                <SvgCssUri uri={levelUri} />
              </View>
              <Text style={styles.number}>Lv. {level.number}</Text>
            </LearningButton>
            {level.stars > 0 && (
              <View pointerEvents="none" accessible={false} style={styles.stars}>
                <SvgCssUri uri={starsUri} />
              </View>
            )}
            {!level.reached && index === levels.length - 1 && (
              <View pointerEvents="none" style={styles.cloud}>
                <View style={StyleSheet.absoluteFill}>
                  <SvgCssUri uri={cloudRight} />
                </View>
                <SvgCssUri uri={cloudLeft} />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  path: { width: 370 },
  slot: { position: 'absolute', width: 82, height: 113 },
  level: { width: 78, height: 81, borderRadius: 45 },
  art: { position: 'absolute', width: 78, height: 81 },
  number: { color: colors.white, fontSize: 24, fontWeight: '700', letterSpacing: 0.48 },
  stars: { position: 'absolute', top: 77, left: 1, width: 80.64, height: 32 },
  cloud: { position: 'absolute', top: 15, left: -20, width: 97, height: 72.095 },
});
