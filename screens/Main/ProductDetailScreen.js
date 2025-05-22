// screens/Main/ProductDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, Share, Alert } from 'react-native';
import { Text, useTheme, ActivityIndicator, Button, Card, Title, Paragraph, IconButton, Divider } from 'react-native-paper';
import { fetchProductById } from '../../services/productService';
import { useFocusEffect } from '@react-navigation/native';
import { useNotifications } from '../../contexts/NotificationContext'; // If you want to add to favorites notification

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const theme = useTheme();
  const { showAppNotification } = useNotifications();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // Local state for favorite

  const loadProductDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProduct = await fetchProductById(productId);
      setProduct(fetchedProduct);
      // Here you would also check if this product is in user's favorites
      // For now, we'll just use a local toggle
      // e.g., const favorites = await AsyncStorage.getItem('favorites');
      // setIsFavorite(favorites && JSON.parse(favorites).includes(productId));
    } catch (e) {
      setError(e.message || 'Failed to load product details.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // useFocusEffect or useEffect for initial load
  useEffect(() => {
    loadProductDetails();
  }, [loadProductDetails]);

  // Optional: If you want to refresh when the screen comes into focus
  // useFocusEffect(loadProductDetails);

  const toggleFavorite = async () => {
    // In a real app, update AsyncStorage or backend
    setIsFavorite(!isFavorite);
    showAppNotification(
      !isFavorite ? `${product.name} added to favorites!` : `${product.name} removed from favorites!`,
      'info'
    );
    // Example with AsyncStorage:
    // try {
    //   const favsString = await AsyncStorage.getItem('favorites');
    //   let favsArray = favsString ? JSON.parse(favsString) : [];
    //   if (!isFavorite) { // If it's going to be favorited
    //     favsArray.push(productId);
    //   } else { // If it's going to be unfavorited
    //     favsArray = favsArray.filter(id => id !== productId);
    //   }
    //   await AsyncStorage.setItem('favorites', JSON.stringify(favsArray));
    // } catch (e) { console.error("Failed to update favorites", e); }
  };

  const onShare = async () => {
    if (!product) return;
    try {
      const result = await Share.share({
        message: `Check out this product: ${product.name} - ${product.description}. Price: $${product.price.toFixed(2)}`,
        // url: product.productUrl, // If you have a web URL for the product
        title: `Share ${product.name}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };


  useEffect(() => {
    // Set the header title dynamically once the product is loaded
    if (product) {
      navigation.setOptions({ title: product.name });
    }
  }, [product, navigation]);


  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Error: {error}</Text>
        <Button onPress={loadProductDetails}>Try Again</Button>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card elevation={2} style={styles.card}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
        <Card.Content style={styles.contentHeader}>
          <View style={styles.titleRow}>
            <Title style={styles.productName}>{product.name}</Title>
            <IconButton
              icon={isFavorite ? "heart" : "heart-outline"}
              color={isFavorite ? theme.colors.error : theme.colors.primary}
              size={30}
              onPress={toggleFavorite}
            />
          </View>
          <Paragraph style={[styles.price, { color: theme.colors.primary }]}>
            ${product.price.toFixed(2)}
          </Paragraph>
          {product.category && <Text style={styles.categoryText}>Category: {product.category}</Text>}
        </Card.Content>
      </Card>

      <Card elevation={1} style={styles.detailsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Description</Title>
          <Paragraph style={styles.description}>{product.description}</Paragraph>
        </Card.Content>
      </Card>

      {/* Add more sections as needed, e.g., reviews, related products */}

      <View style={styles.actionsContainer}>
         <Button
          icon="share-variant"
          mode="contained-tonal"
          onPress={onShare}
          style={styles.actionButton}
        >
          Share
        </Button>
        <Button
          icon="cart-plus"
          mode="contained"
          onPress={() => Alert.alert("Action", "Add to Cart (Not Implemented)")}
          style={styles.actionButton}
        >
          Add to Cart
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    margin: 0, // No margin if it's the main top card
    borderRadius: 0, // No border radius for top card for full width image effect
  },
  image: {
    width: '100%',
    height: 300, // Adjust as needed
    resizeMode: 'cover', // Or 'contain' if you prefer
  },
  contentHeader: {
    padding: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1, // Allow text to wrap if long
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 14,
    color: 'grey',
    fontStyle: 'italic',
  },
  detailsCard: {
    margin: 10,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white', // Or theme.colors.surface
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ProductDetailScreen;