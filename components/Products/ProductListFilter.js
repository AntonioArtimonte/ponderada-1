import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import colors from '../../constants/colors';

export default function ProductListFilter({ categories, active, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {categories.map(cat => (
        <Chip
          key={cat}
          selected={active === cat}
          style={[styles.chip, active === cat && { backgroundColor: colors.secondary }]}
          textStyle={{ color: active === cat ? '#FFF' : colors.text }}
          onPress={() => onSelect(cat)}
        >
          {cat}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingVertical: 4 },
  chip: { marginRight: 8, borderRadius: 20, backgroundColor: '#EEE' },
});