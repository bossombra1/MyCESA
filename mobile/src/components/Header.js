import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Header({ titre, onBack }) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Retour</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.titre}>{titre}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1B2A4A', padding: 20, paddingTop: 48, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  backTxt: { color: '#60A5FA', fontSize: 14, fontWeight: '600' },
  titre: { color: '#fff', fontSize: 20, fontWeight: '800' },
});