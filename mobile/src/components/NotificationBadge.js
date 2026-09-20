import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getUnreadCountCible } from '../api/api';

const NotificationBadge = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCountCible();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Erreur chargement compteur notifications:', error);
    }
  };

  return (
    <View style={styles.container}>
      {children}
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#D84315', // Couleur CESA
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;