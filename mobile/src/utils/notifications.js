import AsyncStorage from '@react-native-async-storage/async-storage';

export const enregistrerTokenPush = async (userId) => {
  try {
    console.log('Push notifications disponibles uniquement sur APK');
  } catch (err) {
    console.log('Erreur push:', err);
  }
};

export const envoyerNotificationLocale = async (titre, corps) => {
  try {
    console.log('Notification locale:', titre, corps);
  } catch (err) {
    console.log('Erreur notif locale:', err);
  }
};