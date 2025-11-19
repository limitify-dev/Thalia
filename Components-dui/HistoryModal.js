import React, {useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';
import {useTranslation} from '../utils/translate';
import {useDispatch, useSelector} from 'react-redux';
import {fetchTranslations} from '../redux/translationSlice';

const HistoryModal = ({visible, onClose, text, title, userPrompt}) => {
  const insets = useSafeAreaInsets();
  const {mode} = useTheme();
  const lang = useSelector(state => state.language.lang);
  const dispatch = useDispatch();
  const currentColors = colors[mode];
  const {t} = useTranslation();

  useEffect(() => {
    if (visible) {
      const textsToTranslate = [title || '', text || '', userPrompt || ''];
      const uniqueTexts = Array.from(
        new Set(textsToTranslate.filter(text => text)),
      );
      if (uniqueTexts.length > 0) {
        dispatch(fetchTranslations(uniqueTexts, lang));
      }
    }
  }, [visible, dispatch, title, text, userPrompt, lang]);

  const translatedTitle = t(title);
  const translatedText = t(text);
  const translatedPrompt = userPrompt ? t(userPrompt) : '';

  // Prepare data for FlatList - more efficient on iOS
  const sections = [
    ...(translatedPrompt
      ? [{id: 'prompt', content: translatedPrompt, type: 'prompt'}]
      : []),
    {id: 'response', content: translatedText, type: 'response'},
  ];

  const renderItem = ({item}) => (
    <View
      style={
        item.type === 'prompt'
          ? styles.promptContainer
          : styles.responseContainer
      }>
      {item.type === 'prompt' && (
        <Text style={[styles.promptLabel, {color: currentColors.titleColor}]}>
          Your Question:
        </Text>
      )}
      <Text
        style={[
          styles.modalText,
          {color: currentColors.titleColor},
          item.type === 'prompt' && styles.promptText,
        ]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}>
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor: currentColors.modalOverlayBackground,
          },
        ]}>
        <TouchableOpacity
          style={styles.outsideTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: currentColors.skyBlue || '#1C1C1E',
              marginTop: insets.top || 20,
              marginBottom: insets.bottom || 20,
            },
          ]}>
          <View style={styles.modalHeader}>
            <Text
              style={[styles.modalTitle, {color: currentColors.titleColor}]}>
              {translatedTitle}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={currentColors.titleColor} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={sections}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEventThrottle={16}
            decelerationRate={Platform.OS === 'ios' ? 'normal' : 0.985}
            scrollsToTop={Platform.OS === 'ios'}
            directionalLockEnabled={true}
            indicatorStyle={Platform.OS === 'ios' ? 'black' : null}
            ListFooterComponent={<View style={{height: 40}} />}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  listContent: {
    padding: 20,
  },
  promptContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#9370DB',
  },
  responseContainer: {
    marginBottom: 20,
  },
  promptLabel: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  promptText: {
    fontStyle: 'italic',
  },
  outsideTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default HistoryModal;
