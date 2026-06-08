import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import StackNavigator from './src/navigation/StackNavigator';
import { pedirPermisosNotificaciones } from './src/services/notifications.service';
import * as Notifications from 'expo-notifications';

function RootApp() {
  const { user } = useAuth();

  useEffect(() => {
    const inicializarNotificaciones = async () => {
      const permiso = await pedirPermisosNotificaciones();
      if (!permiso) return;
    };

    inicializarNotificaciones();

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notificación tocada:', data);
    });

    return () => subscription.remove();
  }, []);

  return <StackNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}