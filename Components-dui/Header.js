import React from 'react';
import {View, Text, StyleSheet, Platform, Dimensions} from 'react-native';
import {useTranslation} from '../utils/translate';

const Header = ({
  leftComponents = null,
  title = '',
  rightComponents = null,
  containerStyle = {},
  titleStyle = {},
}) => {
  const {t} = useTranslation();
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.sideContainer}>
        {Array.isArray(leftComponents)
          ? leftComponents.map((comp, index) => (
              <View key={index} style={styles.iconWrapper}>
                {comp}
              </View>
            ))
          : leftComponents}
      </View>

      {title ? (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {t(title)}
          </Text>
        </View>
      ) : null}

      <View style={styles.sideContainer}>
        {Array.isArray(rightComponents)
          ? rightComponents.map((comp, index) => (
              <View key={index} style={styles.iconWrapper}>
                {comp}
              </View>
            ))
          : rightComponents}
      </View>
    </View>
  );
};

const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 100 : 70,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  sideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  iconWrapper: {
    marginHorizontal: 4,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Platform.OS === 'ios' ? 50 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34456f',
  },
});

export default Header;
