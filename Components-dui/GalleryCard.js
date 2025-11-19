import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FavIcon from '../assets/dark_icons/fav.svg';
import {useTheme} from '../contexts/ThemeContext';
import {colors, gredientColors} from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const GalleryCard = ({
  title,
  location,
  distance,
  exhibitionType,
  exhibitionCategory,
  timing,
  image,
  isBookmarked = false,
  onBookmarkPress,
  onPress,
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            onPress={onBookmarkPress}
            style={styles.bookmarkButton}>
            <FavIcon
              width={24}
              height={24}
              fill={isBookmarked ? '#4A4AFF' : 'none'}
              stroke={isBookmarked ? '#4A4AFF' : '#FFF'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-outline" size={16} color="#FFF" />
          <Text style={styles.infoText}>
            {location} <Text style={styles.distanceText}>({distance})</Text>
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="calendar-outline" size={16} color="#FFF" />
          <Text style={styles.infoText}>
            {exhibitionType}{' '}
            <Text style={styles.categoryText}>({exhibitionCategory})</Text>
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="time-outline" size={16} color="#FFF" />
          <Text style={styles.infoText}>{timing}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    height: 185,
  },
  imageContainer: {
    width: 136,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    marginRight: 8,
  },
  bookmarkButton: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
  },
  distanceText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default GalleryCard;
