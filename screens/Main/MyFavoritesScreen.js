import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCard from '../../components/Products/ProductCard';
import { fetchProducts } from '../../services/productService';
import { useNotifications } from '../../contexts/NotificationContext';

const FAVORITES_KEY = '@favorites';

export default function MyFavoritesScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { showAppNotification } = useNotifications();

  const [favorites, setFavorites] = useState({});
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
          const favoritesData = JSON.parse(storedFavorites);
          setFavorites(favoritesData);
          
          // Get all favorite product IDs
          const favoriteIds = Object.entries(favoritesData)
            .filter(([_, isFavorite]) => isFavorite)
            .map(([id]) => id);

          if (favoriteIds.length > 0) {
            // Fetch the full product details for each favorite
            const products = await Promise.all(
              favoriteIds.map(id => fetchProducts(1, 1, { id }))
            );
            
            // Extract the products from the responses and ensure no duplicates
            const uniqueProducts = products
              .map(response => response.data?.[0])
              .filter(Boolean)
              .reduce((acc, product) => {
                if (!acc.find(p => p.id === product.id)) {
                  acc.push(product);
                }
                return acc;
              }, []);
            
            setFavoriteProducts(uniqueProducts);
          } else {
            setFavoriteProducts([]);
          }
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        showAppNotification('Failed to load favorites', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [showAppNotification]);

  const handleToggleFavorite = async (productId) => {
    try {
      const newFavorites = {
        ...favorites,
        [productId]: !favorites[productId]
      };
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      
      // Update the products list
      if (newFavorites[productId]) {
        // If it's being favorited, fetch and add the product
        const response = await fetchProducts(1, 1, { id: productId });
        const product = response.data?.[0];
        if (product) {
          setFavoriteProducts(prev => {
            // Check if product already exists to prevent duplicates
            if (prev.some(p => p.id === product.id)) {
              return prev;
            }
            return [...prev, product];
          });
          showAppNotification(`${product.name} added to favorites!`, 'success');
        }
      } else {
        // If it's being unfavorited, remove the product
        const product = favoriteProducts.find(p => p.id === productId);
        setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
        if (product) {
          showAppNotification(`${product.name} removed from favorites`, 'info');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showAppNotification('Failed to update favorites', 'error');
    }
  };

  const handleProductPress = (productId) => {
    navigation.navigate('HomeTab', {
      screen: 'ProductList',
      params: {
        screen: 'ProductDetail',
        params: { productId }
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favoriteProducts}
        numColumns={2}
        keyExtractor={item => `favorite-${item.id}`}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            isFavorite={favorites[item.id]}
            onPress={() => handleProductPress(item.id)}
            onFavoritePress={() => handleToggleFavorite(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No favorites yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = theme =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 8 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  });
