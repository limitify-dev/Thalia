import React from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../constants/colors';
import {useTheme} from '../contexts/ThemeContext';
import {useEffect} from 'react';
import {
  getSpacing,
  getFontSize,
  getBorderRadius,
  getIconSize,
} from '../constants/responsive';

const {width, height} = Dimensions.get('window');

const GENDERS = [
  {id: 'male', label: 'Male', icon: 'male'},
  {id: 'female', label: 'Female', icon: 'female'},
  {id: 'other', label: 'Other', icon: 'person'},
];

const GenderPicker = ({visible, onClose, onSelect, selectedGender}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [visible]);

  const handleBackPress = () => {
    if (visible) {
      onClose();
      return true;
    }
    return false;
  };

  const handleGenderSelect = gender => {
    if (onSelect) {
      onSelect(gender);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleModalClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleModalClose}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['rgb(15, 15, 15)', 'rgb(97, 88, 101)']}
            start={{x: 1, y: 1}}
            end={{x: 0, y: 0}}
            style={styles.modalContainer}>
            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={[styles.backButton, {borderColor: '#FFFFFF'}]}
                  onPress={handleModalClose}>
                  <Icon
                    name="chevron-back"
                    size={getIconSize(24)}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Gender</Text>
                <View style={styles.headerRight} />
              </View>

              <View
                style={[
                  styles.genderContainer,
                  {backgroundColor: currentColors.skyBlue},
                ]}>
                {GENDERS.map((gender, index) => (
                  <TouchableOpacity
                    key={gender.id}
                    style={[
                      styles.genderItem,
                      selectedGender === gender.id && styles.selectedGenderItem,
                      index === GENDERS.length - 1 && styles.lastGenderItem,
                    ]}
                    onPress={() => handleGenderSelect(gender.id)}
                    activeOpacity={0.7}>
                    <Icon
                      name={gender.icon}
                      size={getIconSize(24)}
                      color="#FFFFFF"
                      style={styles.genderIcon}
                    />
                    <Text
                      style={[
                        styles.genderText,
                        selectedGender === gender.id &&
                          styles.selectedGenderText,
                      ]}>
                      {gender.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'transparent',
    borderTopLeftRadius: getBorderRadius(25),
    borderTopRightRadius: getBorderRadius(25),
    overflow: 'hidden',
  },
  modalContainer: {
    width: '100%',
  },
  contentContainer: {
    paddingTop: getSpacing(20),
    paddingBottom: getSpacing(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(20),
    marginBottom: getSpacing(10),
  },
  headerTitle: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    width: getIconSize(40),
    height: getIconSize(40),
    borderRadius: getBorderRadius(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerRight: {
    width: getIconSize(40),
  },
  genderContainer: {
    marginHorizontal: getSpacing(20),
    padding: getSpacing(12),
    borderRadius: getBorderRadius(22),
  },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getSpacing(12),
    marginBottom: getSpacing(8),
    borderRadius: getBorderRadius(12),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastGenderItem: {
    marginBottom: 0,
  },
  selectedGenderItem: {
    backgroundColor: colors.primary,
  },
  genderIcon: {
    marginRight: getSpacing(12),
  },
  genderText: {
    fontSize: getFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectedGenderText: {
    fontWeight: '600',
  },
});

export default GenderPicker;
