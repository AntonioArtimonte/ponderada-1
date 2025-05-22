import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Surface, IconButton, useTheme, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with margins

export default function ProductCard({ product, isFavorite, onFavoritePress, onPress }) {
  const theme = useTheme();

  return (
    <Surface style={styles.container}>
      <TouchableOpacity 
        onPress={onPress} 
        style={styles.touchable}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.imageOverlay}>
            <IconButton
              icon={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              iconColor={isFavorite ? theme.colors.error : 'white'}
              style={styles.favoriteButton}
              onPress={onFavoritePress}
            />
            {product.rating?.rate >= 4.5 && (
              <Badge style={styles.badge}>
                <MaterialCommunityIcons name="star" size={12} color="white" />
                <Text style={styles.badgeText}>Top Rated</Text>
              </Badge>
            )}
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${product.price.toFixed(2)}
            </Text>
            {product.price < 50 && (
              <Badge style={styles.dealBadge}>Deal</Badge>
            )}
          </View>
          <View style={styles.footer}>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons
                name="star"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.rating}>
                {product.rating?.rate || '4.5'}
              </Text>
            </View>
            <Text style={styles.reviews}>
              ({product.rating?.count || '100'} reviews)
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    margin: 8,
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    paddingTop: '100%', // 1:1 aspect ratio
    backgroundColor: '#f8f9fa',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    margin: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dealBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviews: {
    fontSize: 11,
    color: '#666',
  },
}); 