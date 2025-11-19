import { colorScheme } from "nativewind";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

const BouncyDots = () => {
  const colorScheme = useColorScheme();
  // Create animated values for each dot
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create staggered animations for each dot with different timing
    const createDotAnimation = (
      animValue: any,
      delay: number,
      duration: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations with different parameters for each dot
    const anim1 = createDotAnimation(dot1Anim, 0, 600);
    const anim2 = createDotAnimation(dot2Anim, 200, 800);
    const anim3 = createDotAnimation(dot3Anim, 400, 700);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  // Custom interpolation for each dot to create "odd" bouncing
  const getDotStyle = (animValue: any, index: number) => {
    // Different bounce patterns for each dot
    const bouncePatterns = [
      // First dot: normal bounce with slight rotation
      {
        translateY: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, -15, 0],
        }),
        scale: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.2, 1],
        }),
        rotate: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "10deg"],
        }),
      },
      // Second dot: delayed, higher bounce with squeeze effect
      {
        translateY: animValue.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, -20, -5, 0],
        }),
        scaleX: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.8, 1],
        }),
        scaleY: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.3, 1],
        }),
      },
      // Third dot: quick bounce with stretch effect
      {
        translateY: animValue.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, -12, -8, 0],
        }),
        scaleX: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.4, 1],
        }),
        scaleY: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.7, 1],
        }),
      },
    ];

    return {
      transform: [
        { translateY: bouncePatterns[index].translateY },
        { scale: bouncePatterns[index].scale || 1 },
        { scaleX: bouncePatterns[index].scaleX || 1 },
        { scaleY: bouncePatterns[index].scaleY || 1 },
        { rotate: bouncePatterns[index].rotate || "0deg" },
      ],
      opacity: animValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.6, 1, 0.6],
      }),
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            {
              ...styles.dot,
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(0, 0, 0, 0.9)",
            },
            getDotStyle(dot1Anim, 0),
          ]}
        />
        <Animated.View
          style={[
            {
              ...styles.dot,
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(0, 0, 0, 0.9)",
            },
            getDotStyle(dot2Anim, 1),
          ]}
        />
        <Animated.View
          style={[
            {
              ...styles.dot,
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(0, 0, 0, 0.9)",
            },
            getDotStyle(dot3Anim, 2),
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,

    marginHorizontal: 6,
  },
});

export default BouncyDots;
