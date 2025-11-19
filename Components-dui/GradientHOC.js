import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';

const withGradientBackground = WrappedComponent => {
  return props => {
    const mode = useSelector(state => state.theme.mode);
    const isDark = mode === 'dark';
    // Tailwind dark mode: from-slate-900 to transparent
    const darkGradientBase = [
      'rgba(41, 33, 77, 1)',
      'rgba(41, 33, 77, 1)',
      'rgba(62, 33, 107, 1)',
      'rgba(81, 33, 140, 1)',
      'rgba(81, 33, 140, 1)',

      'rgba(89, 46, 153, 1)',
      'rgba(107, 40, 147, 1)',
      'rgba(107, 40, 147, 1)',

      'rgba(65, 50, 153, 1)',
      'rgba(65, 50, 153, 1)',

      // 'rgba(65, 50, 153, 1)',

      'rgba(65, 50, 153, 1)',
    ];

    const lightGradientBase = [
      'rgb(242,244,255)', // light blue
      'rgb(242,244,255)', // light blue
      'rgb(242,244,255)', // light blue
      'rgb(242,244,255)', // light blue

      'rgb(237,238,254)', // soft purple
      'rgb(228,228,253)', // lavender
      'rgba(230, 230, 255, 1)', // slight lavender
      // 'rgba(230, 230, 255, 1)', // slight lavender

      'rgb(245,226,246)', // pink hint
      'rgb(245,226,246)', // pink hint
      'rgb(245,226,246)', // pink hint

      'rgb(242,244,255)',
      'rgb(242,244,255)',
      'rgb(242,244,255)',

      'rgb(242,244,255)',
      'rgb(242,244,255)',
    ];
    const lightmode = {x: 0.2, y: 1.1};
    const darkmode = {x: 1, y: 1.1};
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={isDark ? darkGradientBase : lightGradientBase}
          start={{x: 0, y: 0}} // top-left
          end={isDark ? darkmode : lightmode} // bottom-right
          style={StyleSheet.absoluteFill}
        />

        <WrappedComponent {...props} />
      </View>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});

export default withGradientBackground;
