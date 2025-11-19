import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {colors} from '../constants/colors';
// import LinearGradient from 'react-native-linear-gradient';
// import { colors } from '../constants/colors';

// Assuming your image is in assets/images/
const cornerImage = require('../assets/images/gredient.png');

const GradientBackground = ({children, mode = 'light'}) => {
  const currentColors = colors[mode];
  // const gradientColors =
  //   mode === 'light'
  //     ? ['#FFFFFF', '#F5F5F5', '#E6E6FA']
  //     : [colors.dark.primary, '#121212', '#000000'];

  return (
    <View
      style={{...styles.container, backgroundColor: currentColors.background}}>
      {/* <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient> */}
      <Image
        source={cornerImage}
        style={styles.cornerImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  cornerImage: {
    position: 'absolute',
    top: 20, // Adjust as needed
    right: 20, // Adjust as needed
    width: 100, // Adjust as needed
    height: 100, // Adjust as needed
  },
});

export default GradientBackground;
