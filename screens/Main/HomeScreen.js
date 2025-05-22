import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {
  Text,
  Searchbar,
  useTheme,
  FAB,
  Chip,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import BackgroundShapes from '../../components/UI/BackgroundShapes';
import ProductCard from '../../components/Products/ProductCard';
import { fetchProducts } from '../../services/productService';
import { APP_CONFIG } from '../../config/appConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '../../contexts/NotificationContext';

const CATEGORIES = [
  'All',
  'Electronics',
  'Furniture',
  'Clothing',
  'Vehicles',
  'Garden',
  'Media',
  'Toys',
];

const FAVORITES_KEY = '@favorites';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { showAppNotification } = useNotifications();

  // states...
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [inputTerm, setInputTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [favorites, setFavorites] = useState({});

  const loadProducts = useCallback(
    async (pageNum = 1, refreshing = false) => {
      if (isLoading && !refreshing) return;
      setIsLoading(true);
      if (refreshing) setIsRefreshing(true);
      setError(null);

      try {
        const filters = {};
        if (searchTerm) filters.searchTerm = searchTerm;
        if (activeCategory !== 'All') filters.category = activeCategory;

        const response = await fetchProducts(
          pageNum,
          APP_CONFIG.productsPerPage,
          filters
        );
        const data = response.data || [];

        if (pageNum === 1 || refreshing) {
          setProducts(data);
        } else {
          setProducts(prev => [...prev, ...data]);
        }
        setHasNextPage(response.hasNextPage);
        setPage(pageNum);
      } catch (e) {
        setError(e.message || 'Failed to load items.');
      } finally {
        setIsLoading(false);
        if (refreshing) setIsRefreshing(false);
      }
    },
    [isLoading, searchTerm, activeCategory]
  );

  useEffect(() => {
    loadProducts(1, false);
  }, [searchTerm, activeCategory]);

  useFocusEffect(
    React.useCallback(() => {
      // optional refresh on focus
    }, [])
  );

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Save favorites when they change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    };
    saveFavorites();
  }, [favorites]);

  const handleToggleFavorite = useCallback(async (productId) => {
    try {
      const newFavorites = {
        ...favorites,
        [productId]: !favorites[productId]
      };
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);

      // Show notification
      const product = products.find(p => p.id === productId);
      if (product) {
        if (newFavorites[productId]) {
          showAppNotification(`${product.name} added to favorites!`, 'success');
        } else {
          showAppNotification(`${product.name} removed from favorites`, 'info');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showAppNotification('Failed to update favorites', 'error');
    }
  }, [favorites, products, showAppNotification]);

  const handleLoadMore = () => {
    if (!isLoading && hasNextPage) {
      loadProducts(page + 1, false);
    }
  };

  const onRefresh = () => loadProducts(1, true);
  const onSubmitSearch = () => setSearchTerm(inputTerm.trim());
  const onClearSearch = () => {
    setInputTerm('');
    setSearchTerm('');
  };
  const selectCategory = cat => setActiveCategory(cat);

  if (isLoading && page === 1 && !isRefreshing) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: theme.colors.error }}>Error: {error}</Text>
        <FAB small icon="refresh" onPress={() => loadProducts(1, true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundShapes />
      <Searchbar
        placeholder="Search marketplace"
        onChangeText={setInputTerm}
        value={inputTerm}
        onSubmitEditing={onSubmitSearch}
        onIconPress={onSubmitSearch}
        onClearIconPress={onClearSearch}
        style={styles.searchbar}
        returnKeyType="search"
        elevation={2}
      />
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <Chip
              key={cat}
              selected={activeCategory === cat}
              style={[
                styles.chip,
                activeCategory === cat && { backgroundColor: theme.colors.secondary },
              ]}
              textStyle={{
                color: activeCategory === cat ? '#fff' : theme.colors.text,
              }}
              onPress={() => selectCategory(cat)}
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            isFavorite={favorites[item.id]}
            onPress={id => navigation.navigate('ProductDetail', { productId: id })}
            onFavoritePress={() => handleToggleFavorite(item.id)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && page > 1 ? (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              size="small"
              color={theme.colors.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>No items found.</Text> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = theme =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchbar: { margin: 8, borderRadius: 25 },
    categoriesContainer: { paddingHorizontal: 8, paddingVertical: 4 },
    chip: { marginRight: 8 },
    listContent: { paddingHorizontal: 8, paddingBottom: 20 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  });
