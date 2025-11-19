import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {colors} from '../constants/colors';
import CountryPicker, {
  getAllCountries,
} from 'react-native-country-picker-modal';
import {
  getSpacing,
  getFontSize,
  getBorderRadius,
  platformSpecific,
} from '../constants/responsive';

const PhoneInput = ({
  label,
  value,
  onChangeText,
  onChangeFormatted,
  placeholder = 'Enter phone number',
  keyboardType = 'phone-pad',
  editable = true,

  // Color Props
  labelColor: propLabelColor,
  inputTextColor: propInputTextColor,
  placeholderTextColor: propPlaceholderTextColor,
  iconColor: propIconColor,
  backgroundColorStart: propBgStart,
  backgroundColorEnd: propBgEnd,

  ...props
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];
  const isDark = mode === 'dark';

  const [countryCode, setCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [allCountries, setAllCountries] = useState([]);
  const [number, setNumber] = useState('');

  // Colors
  const textColor =
    propInputTextColor || (isDark ? '#FFFFFF' : currentColors.text);
  const placeholderColor =
    propPlaceholderTextColor ||
    (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)');
  const labelColor =
    propLabelColor || (isDark ? 'rgba(255,255,255,0.8)' : currentColors.text);
  const iconColor = propIconColor || (isDark ? '#FFFFFF' : currentColors.text);

  const inputGradientColors = [
    propBgStart ||
      (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)'),
    propBgEnd ||
      (isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.4)'),
  ];

  // Load all countries
  useEffect(() => {
    getAllCountries().then(setAllCountries);
  }, []);

  // Parse initial value
  useEffect(() => {
    if (value && allCountries.length) {
      const raw = value.startsWith('+') ? value : `+${value}`;
      const matched = allCountries.find(c =>
        raw.startsWith(`+${c.callingCode[0]}`),
      );
      if (matched) {
        const local = raw.replace(`+${matched.callingCode[0]}`, '').trim();
        setCountryCode(matched.cca2);
        setCallingCode(matched.callingCode[0]);
        setNumber(local);
      } else {
        setNumber(value);
      }
    }
  }, [value, allCountries]);

  const onSelectCountry = country => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode?.[0] || '');
    setNumber('');
    onChangeText?.('');
    onChangeFormatted?.(`+${country.callingCode?.[0]}`);
    setPickerVisible(false);
  };

  const handlePhoneChange = text => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const maxAllowedDigits = 15 - callingCode.length;
    const trimmed = cleaned.slice(0, maxAllowedDigits);

    setNumber(trimmed);
    onChangeText?.(trimmed);
    onChangeFormatted?.(`+${callingCode}${trimmed}`);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, {color: labelColor}]}>{label}</Text>
      <LinearGradient
        colors={inputGradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.countryPickerButton}
          onPress={() => setPickerVisible(true)}>
          <CountryPicker
            countryCode={countryCode}
            withFilter
            withFlag
            withCallingCodeButton={false}
            withEmoji
            withAlphaFilter
            onSelect={onSelectCountry}
            visible={pickerVisible}
            onClose={() => setPickerVisible(false)}
            containerButtonStyle={styles.countryPickerFlag}
          />
          <Image
            source={require('../assets/images/arrowDown.png')}
            style={[styles.arrowDown, {tintColor: iconColor}]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={[styles.callingCodeText, {color: textColor}]}>
          +{callingCode}
        </Text>

        <TextInput
          style={[styles.input, {color: textColor}]}
          value={number}
          onChangeText={handlePhoneChange}
          placeholder="___ ___ ____"
          placeholderTextColor={placeholderColor}
          keyboardType="phone-pad"
          editable={editable}
          {...props}
        />

        <View style={styles.iconWrapper}>
          <Image
            source={require('../assets/images/Calling.png')}
            style={[styles.calling, {tintColor: iconColor}]}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: getSpacing(16),
  },
  inputLabel: {
    fontSize: getFontSize(14),
    marginBottom: getSpacing(8),
    fontWeight: '500',
  },
  inputContainer: {
    borderRadius: getBorderRadius(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: platformSpecific(getSpacing(0), getSpacing(10)),
    height: 55,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: getSpacing(8),
    paddingVertical: getSpacing(5),
  },
  countryPickerFlag: {},
  arrowDown: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  callingCodeText: {
    fontSize: getFontSize(16),
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: getFontSize(16),
    height: '100%',
    paddingVertical: Platform.OS === 'ios' ? 18 : 12,
    paddingHorizontal: 0,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: getSpacing(10),
    marginRight: platformSpecific(getSpacing(14), 0),
  },
  calling: {
    width: 25,
    height: 25,
  },
});

export default PhoneInput;
