import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import DarkHelpCenterArrow from '../assets/dark_icons/helpCenterArrow.svg';
import LightHelpCenterArrow from '../assets/light_icon/helpCenterArrow.svg';
import {getBorderRadius} from '../constants/responsive';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({question, answer, isOpen, onPress}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress();
  };

  const gradientBackgroundBoxColors = {
    light: ['#cdd5e2', '#cdd5e2'],
    dark: ['rgb(86, 78, 110)', 'rgb(61,47,96)'],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientBackgroundBoxColors[mode]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          styles.input,
          {
            borderWidth: 1,
            borderColor:
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.4)'
                : 'rgba(255, 255, 255, 0.4)',
            borderRadius: getBorderRadius(12),
          },
        ]}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={toggleExpand}
          activeOpacity={0.8}>
          <Text
            style={[styles.questionText, {color: currentColors.titleColor}]}>
            {question}
          </Text>
          {mode === 'dark' ? (
            <DarkHelpCenterArrow
              width={20}
              height={20}
              style={isOpen ? styles.rotateIcon : {}}
            />
          ) : (
            <LightHelpCenterArrow
              width={20}
              height={20}
              style={isOpen ? styles.rotateIcon : {}}
            />
          )}
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.answerContainer}>
            <View style={styles.separator} />
            <Text
              style={[styles.answerText, {color: currentColors.titleColor}]}>
              {answer}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: getBorderRadius(12),
    marginBottom: 12,
    overflow: 'hidden',
  },
  input: {
    borderRadius: getBorderRadius(12),
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    marginRight: 12,
    textAlign: 'left',
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  rotateIcon: {
    transform: [{rotate: '180deg'}],
  },
});

export default FAQItem;
