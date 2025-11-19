import * as Haptics from "expo-haptics";
import { ComponentProps } from "react";
import { Pressable, PressableProps } from "react-native";

export function HapticTab(props: PressableProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
}
