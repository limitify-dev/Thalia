import React, { useRef, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { colors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');
const scale = Math.min(width, height) / 375;

const CustomOTPInput = ({ value = '', length = 4, onChange }) => {
    const { mode } = useTheme();
    const currentColors = colors[mode];
    const [focusedIndex, setFocusedIndex] = useState(0);

    // Create array of refs for each input
    const inputRefs = useRef([...Array(length)].map(() => React.createRef()));

    // Handle input change
    const handleChange = (text, index) => {
        const newValue = value.split('');
        newValue[index] = text;
        const newOtp = newValue.join('');

        onChange(newOtp);

        // Move to next input if there's a value
        if (text.length === 1 && index < length - 1) {
            inputRefs.current[index + 1].current.focus();
        }
    };

    // Handle backspace
    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1].current.focus();
        }
    };

    // Handle input focus
    const handleFocus = (index) => {
        setFocusedIndex(index);
    };

    // Handle paste
    const handlePaste = (text, index) => {
        if (text.length > 1) {
            // If pasted text is longer than 1 character
            const pastedText = text.slice(0, length);
            onChange(pastedText);

            // Focus last input
            if (pastedText.length === length) {
                inputRefs.current[length - 1].current.focus();
            } else {
                inputRefs.current[pastedText.length].current.focus();
            }
        }
    };

    return (
        <View style={styles.container}>
            {[...Array(length)].map((_, index) => (
                <TextInput
                    key={index}
                    ref={inputRefs.current[index]}
                    style={[
                        styles.input,
                        {
                            borderColor: focusedIndex === index ? currentColors.primary : 'rgba(255, 255, 255, 0.3)',
                            color: currentColors.white,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    ]}
                    value={value[index] || ''}
                    onChangeText={(text) => {
                        handleChange(text, index);
                        handlePaste(text, index);
                    }}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => handleFocus(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    selectionColor={currentColors.primary}
                    returnKeyType={index === length - 1 ? 'done' : 'next'}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        gap: 12 * scale,
    },
    input: {
        width: 70 * scale,
        height: 70 * scale,
        borderRadius: 35 * scale,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 24 * scale,
        fontWeight: '500',
    },
});

export default CustomOTPInput; 