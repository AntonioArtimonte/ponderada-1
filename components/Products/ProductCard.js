// components/Products/ProductCard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, IconButton, useTheme, Text } from 'react-native-paper';

export default function ProductCard({
  item,
  onPress,
  isFavorite,
  onFavoritePress,
}) {
  const theme = useTheme();
  return (
    <Card style={styles.card} onPress={() => onPress(item.id)}>
      <View style={styles.imageWrapper}>
        <Card.Cover source={{ uri: item.imageUrl }} style={styles.image} />
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          color={isFavorite ? theme.colors.accent : 'white'}
          size={24}
          style={styles.favoriteIcon}
          onPress={() => onFavoritePress(item.id)}
        />
      </View>
      <Card.Content>
        <Title numberOfLines={1}>{item.name}</Title>
        <Paragraph style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
          ${item.price.toFixed(2)}
        </Paragraph>
        {item.location && <Text variant="bodySmall">{item.location}</Text>}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    height: 140,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
