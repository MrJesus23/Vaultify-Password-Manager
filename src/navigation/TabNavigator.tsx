import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Text, View, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

import HomeScreen from '../screens/home/HomeScreen';
import CredencialesScreen from '../screens/credentials/CredencialesScreen';
import CategoriasScreen from '../screens/categories/CategoriasScreen';
import HistorialScreen from '../screens/history/HistorialScreen';
import FavoritosScreen from '../screens/favorites/FavoritosScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
    <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 0.5,
    }}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        {focused && (
            <View style={{
                width: 10, height: 2, borderRadius: 2,
                backgroundColor: Colors.primary,
                marginTop: 3,
            }} />
        )}
    </View>
);

export default function TabNavigator() {
    const navigation = useNavigation<any>();

    return (
        <Tab.Navigator screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontWeight: 'bold', letterSpacing: 1 },
            headerShadowVisible: false,
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 16 }}>
                    <Text style={{ fontSize: 22 }}>⚙️</Text>
                </TouchableOpacity>
            ),
            tabBarStyle: {
                backgroundColor: Colors.surface,
                borderColor: Colors.border,
                borderTopWidth: 1,
                height: 64,
                paddingBottom: 8,
                paddingTop: 4,
            },
            tabBarShowLabel: true,
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 0.3,
            },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textSecondary,
        }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Inicio',
                    headerTitle: '🔐 Vaultify',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Credenciales"
                component={CredencialesScreen}
                options={{
                    title: 'Vault',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🔑" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Favoritos"
                component={FavoritosScreen}
                options={{
                    title: 'Favoritos',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="⭐" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Categorias"
                component={CategoriasScreen}
                options={{
                    title: 'Categorías',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="📁" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Historial"
                component={HistorialScreen}
                options={{
                    title: 'Historial',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    )
}