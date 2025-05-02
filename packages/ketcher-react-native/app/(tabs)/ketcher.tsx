import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import KetcherEditor from '@/components/KetcherEditor';

export default function KetcherScreen() {
  return (
    <ThemedView style={styles.container}>
      <KetcherEditor />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
