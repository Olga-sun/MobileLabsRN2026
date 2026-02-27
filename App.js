import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const Tab = createMaterialTopTabNavigator();

// 1. Екран Новин
function NewsScreen() {
    return (
        <ScrollView style={styles.screen}>
            <Text style={styles.headerText}>Новини</Text>
            {[1, 2, 3, 4, 5].map((id) => (
                <View key={id} style={styles.newsItem}>
                    <View style={styles.newsImagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#ccc" />
                    </View>
                    <View style={styles.newsTextContainer}>
                        <Text style={styles.newsTitle}>Заголовок новини</Text>
                        <Text style={styles.newsDate}>Дата новини</Text>
                        <Text style={styles.newsText}>Короткий текст новини</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

// 2. Екран Фотогалереї
function GalleryScreen() {
    return (
        <ScrollView style={styles.screen}>
            <View style={styles.galleryContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                    <View key={id} style={styles.galleryItem}>
                        <Ionicons name="image-outline" size={50} color="#ccc" />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

// 3. Екран Реєстрації (Профіль)
function ProfileScreen() {
    return (
        <ScrollView style={styles.screen}>
            <Text style={styles.headerText}>Реєстрація</Text>

            <Text style={styles.label}>Електронна пошта</Text>
            <TextInput style={styles.input} placeholder="Введіть пошту" keyboardType="email-address" />

            <Text style={styles.label}>Пароль</Text>
            <TextInput style={styles.input} placeholder="Введіть пароль" secureTextEntry={true} />

            <Text style={styles.label}>Пароль (ще раз)</Text>
            <TextInput style={styles.input} placeholder="Повторіть пароль" secureTextEntry={true} />

            <Text style={styles.label}>Прізвище</Text>
            <TextInput style={styles.input} placeholder="Ваше прізвище" />

            <Text style={styles.label}>Ім'я</Text>
            <TextInput style={styles.input} placeholder="Ваше ім'я" />

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Зареєструватися</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <View style={styles.container}>

                    {/* ШАПКА (HEADER) */}
                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <Image
                                source={require('./assets/Логотип_Житомирської_політехніки.png')}
                                style={styles.logoImage}
                            />
                        </View>
                        <Text style={styles.appName}>FirstMobileApp</Text>
                    </View>

                    <NavigationContainer>
                        <Tab.Navigator
                            id="root"
                            screenOptions={({ route }) => ({
                                tabBarIcon: ({ color }) => {
                                    let iconName = route.name === 'Головна' ? 'home' :
                                        route.name === 'Фотогалерея' ? 'images' : 'person';
                                    return <Ionicons name={iconName} size={20} color={color} />;
                                },
                                tabBarActiveTintColor: '#007AFF',
                                tabBarInactiveTintColor: 'gray',
                                tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' },
                            })}
                        >
                            <Tab.Screen name="Головна" component={NewsScreen} />
                            <Tab.Screen name="Фотогалерея" component={GalleryScreen} />
                            <Tab.Screen name="Профіль" component={ProfileScreen} />
                        </Tab.Navigator>
                    </NavigationContainer>

                    {/* ПІДПИС (FOOTER) */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Литвинчук Ольга, група ІПЗ-24-3</Text>
                    </View>

                    <StatusBar style="auto"/>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    logoRow: { flexDirection: 'row', alignItems: 'center' },
    logoImage: { width: 150, height: 50, marginRight: 8, resizeMode: 'contain' },
    polytechTitle: { fontSize: 10, fontWeight: 'bold', color: '#003399' },
    polytechSubtitle: { fontSize: 8, color: '#666' },
    appName: { fontWeight: 'bold', fontSize: 14 },

    screen: { flex: 1, padding: 15, backgroundColor: '#fff' },
    headerText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },

    // Новини
    newsItem: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
    newsImagePlaceholder: { width: 80, height: 80, backgroundColor: '#f5f5f5', marginRight: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
    newsTextContainer: { flex: 1 },
    newsTitle: { fontWeight: 'bold', fontSize: 16 },
    newsDate: { color: '#999', fontSize: 12, marginVertical: 2 },
    newsText: { color: '#444', fontSize: 14 },

    // Галерея
    galleryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    galleryItem: { width: '48%', height: 120, backgroundColor: '#f5f5f5', marginBottom: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

    // Реєстрація
    label: { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: '500' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, marginBottom: 15, padding: 10, fontSize: 16 },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Футер
    footer: { padding: 8, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
    footerText: { fontSize: 12, fontStyle: 'italic', color: '#777' }
});