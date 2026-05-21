import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 1. ПЕРЕВІР ЦЕЙ ІМПОРТ
import { ProgressProvider } from '../context/ProgressContext';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {/* 2. ПЕРЕВІР, ЩО ЦЕЙ ТЕГ ОГОРТАЄ ThemeProvider */}
            <ProgressProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </ProgressProvider>
        </GestureHandlerRootView>
    );
}