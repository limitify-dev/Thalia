import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../constants/colors';
import {useTheme} from '../hooks/useTheme';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  getFontSize,
  getSpacing,
  getBorderRadius,
  getModalWidth,
  getScreenHeightPercentage,
} from '../constants/responsive';

const {height} = Dimensions.get('window');

const OptionsModal = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['#29243e', '#666170']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, {color: currentColors.white}]}>
              {title}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={currentColors.white} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <ScrollView style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor:
                      selectedValue === option.value
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'transparent',
                  },
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: currentColors.white,
                      fontWeight:
                        selectedValue === option.value ? '600' : 'normal',
                    },
                  ]}>
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Icon
                    name="checkmark"
                    size={24}
                    color={currentColors.white}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    borderTopLeftRadius: getBorderRadius(24),
    borderTopRightRadius: getBorderRadius(24),
    paddingTop: getSpacing(20),
    paddingBottom: getSpacing(40),
    width: '100%',
    height: height * 0.5,
    backgroundColor: 'rgba(82, 102, 253, 0.8)',
    position: 'absolute',
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(20),
    marginBottom: getSpacing(20),
  },
  title: {
    fontSize: getFontSize(20),
    fontWeight: '600',
  },
  closeButton: {
    padding: getSpacing(8),
  },
  optionsContainer: {
    paddingHorizontal: getSpacing(20),
    flex: 1, // Take remaining space
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(8),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionText: {
    fontSize: getFontSize(16),
  },
  checkIcon: {
    marginLeft: getSpacing(8),
  },
});

export default OptionsModal;
