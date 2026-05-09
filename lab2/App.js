import React, { useState } from 'react';
import {
    FlatList,
    View,
    Text,
    Image,
    StyleSheet,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-gesture-handler';

// --- 1. МОДЕЛЬ ДАНИХ (п. 2.2) ---
const DATA = [
    {
        id: '1',
        title: 'Новина про IT',
        description: 'Розробка на React Native стає все популярнішою завдяки кросплатформеності.',
        image: 'https://picsum.photos/id/1/200/200',
        fullText: 'Тут міг би бути дуже довгий текст про переваги React Native над Flutter...'
    },
    {
        id: '2',
        title: 'Житомирська Політехніка',
        description: 'Студенти успішно опановують мобільну розробку.',
        image: 'https://picsum.photos/id/20/200/200',
        fullText: 'У Житомирській політехніці стартував новий курс з розробки мобільних застосунків.'
    },
    {
        id: '3',
        title: 'Події в університеті',
        description: 'Заплановано проведення хакатону для програмістів.',
        image: 'https://picsum.photos/id/3/200/200',
        fullText: 'Реєстрація на хакатон відкрита до кінця тижня для всіх бажаючих.'
    }
];

// --- 2. ЕКРАН ДЕТАЛЕЙ НОВИНИ (п. 2.4) ---
function DetailsScreen({ route }) {
    const { item } = route.params;
    return (
        <View style={styles.screen}>
            <Image source={{ uri: item.image }} style={styles.detailImage} />
            <Text style={styles.detailTitle}>{item.title}</Text>
            <Text style={styles.detailText}>{item.fullText || item.description}</Text>
        </View>
    );
}

// --- 3. ЕКРАН НОВИН З FLATLIST (п. 2.3) ---
function NewsScreen({ navigation }) {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.newsItem}
            onPress={() => navigation.navigate('Details', { item })}
        >
            <Image source={{ uri: item.image }} style={styles.newsImage} />
            <View style={styles.newsTextContainer}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.newsText}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={DATA}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={<Text style={styles.headerText}>Останні новини</Text>}
            ListFooterComponent={
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Литвинчук Ольга, група ІПЗ-24-3</Text>
                </View>
            }
        />
    );
}

// --- 4. КАСТОМНЕ МЕНЮ (п. 2.6) ---
function CustomDrawerContent(props) {
    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.drawerHeader}>
                <Image
                    source={require('./assets/images/my-photo.jpg')}
                    style={styles.avatar}
                />
                <Text style={styles.drawerUser}>Литвинчук Ольга</Text>
                <Text style={styles.drawerGroup}>Група ІПЗ-24-3</Text>
            </View>
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
}

// --- 5. НАВІГАЦІЯ (п. 2.4 - 2.5) ---
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function NewsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Main" component={NewsScreen} options={{ title: 'Стрічка новин' }} />
            <Stack.Screen name="Details" component={DetailsScreen} options={({ route }) => ({ title: route.params.item.title })} />
        </Stack.Navigator>
    );
}

// ГОЛОВНИЙ КОМПОНЕНТ
export default function App() {
    return (
        <NavigationContainer>
            <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
                <Drawer.Screen name="Новини" component={NewsStack} options={{
                    drawerIcon: ({ color }) => <Ionicons name="newspaper-outline" size={20} color={color} />
                }} />
                <Drawer.Screen name="Контакти" component={() => (
                    <View style={styles.center}><Text>Сторінка контактів (SectionList)</Text></View>
                )} options={{
                    drawerIcon: ({ color }) => <Ionicons name="call-outline" size={20} color={color} />
                }} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

// --- СТИЛІ ---
const styles = StyleSheet.create({
    screen: { flex: 1, padding: 20, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },

    // Картки новин
    newsItem: { flexDirection: 'row', padding: 15, marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 10 },
    newsImage: { width: 80, height: 80, borderRadius: 8 },
    newsTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    newsTitle: { fontSize: 16, fontWeight: 'bold' },
    newsText: { fontSize: 14, color: '#666', marginTop: 4 },

    // Деталі
    detailImage: { width: '100%', height: 250, borderRadius: 15, marginBottom: 20 },
    detailTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    detailText: { fontSize: 16, lineHeight: 24, color: '#444' },

    // Меню (Drawer)
    drawerHeader: { padding: 20, backgroundColor: '#f0f7ff', alignItems: 'center', marginBottom: 10 },

    // --- ОСЬ ТУТ ДОДАНА АВАТАРКА ---
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    // -------------------------------

    drawerUser: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    drawerGroup: { fontSize: 14, color: '#666' },

    // Футер
    footer: { padding: 20, alignItems: 'center' },
    footerText: { fontSize: 12, color: '#999', fontStyle: 'italic' }
});