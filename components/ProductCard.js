import React, { useCallback } from 'react';
import { View, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { commonStyles, colors, spacing, shadows } from '../utils/styles';
import { createPressAnimation } from '../utils/animations';

export const ProductCard = ({ product, isFavorite, onFavoritePress, style }) => {
  const theme = useTheme();
  const scaleAnim = new Animated.Value(1);

  const handlePress = useCallback(() => {
    createPressAnimation(scaleAnim).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            iconColor={isFavorite ? colors.error : colors.surface}
            style={styles.favoriteButton}
            onPress={onFavoritePress}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.rating}>
            <MaterialCommunityIcons
              name="star"
              size={16}
              color={colors.warning}
            />
            <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
          </View>
          <View style={styles.location}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.locationText}>{product.location || 'New York'}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.medium,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing.xs,
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    margin: 0,
  },
  content: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 12,
    color: colors.placeholder,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: spacing.xs,
    color: colors.text,
    fontWeight: '500',
    fontSize: 12,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: spacing.xs,
    color: colors.placeholder,
    fontSize: 10,
  },
}); 