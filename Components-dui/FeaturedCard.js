import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

const FeaturedCard = ({ title, location, image, onPress }) => {
  const { mode } = useTheme();
  const currentColors = colors[mode];

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress}>
      <Image source={image} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardOverlay}>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: currentColors.white }]}>{title}</Text>
          <Text style={[styles.cardLocation, { color: currentColors.darkGray }]}>{location}</Text>
          <TouchableOpacity style={[styles.seeNowButton, { backgroundColor: currentColors.secondary }]}>
            <Text style={[styles.seeNowText, { color: currentColors.white }]}>See Now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <TouchableOpacity style={styles.bookmarkButton}>
        <Icon name="bookmark-outline" size={24} color={currentColors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuredCard: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardLocation: {
    fontSize: 14,
  },
  seeNowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  seeNowText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeaturedCard;