import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { getFavorites } from '../../services/productService';
import ProductCard from '../../components/Products/ProductCard';
import { useAuth } from '../../hooks/useAuth';

export default function MyFavoritesScreen({ navigation }) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await getFavorites(user.id);
        setFavorites(resp.data || []);
      } catch {
        Alert.alert('Error', 'Could not load favorites.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

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
        data={favorites}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={id =>
              navigation.navigate('ProductDetail', { productId: id })
            }
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
    centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list:      { padding: 8 },
    empty:     { flex:1, justifyContent:'center', alignItems:'center', marginTop:50 },
  });
