import { View, Text, Alert } from 'react-native';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

// 1. ІМПОРТУЄМО НАШ ХУК З КОНТЕКСТУ (useState нам більше не треба!)
import { useProgress } from '../../context/ProgressContext';

export default function ClickerScreen() {
    // 2. БЕРЕМО РАХУНОК ТА ФУНКЦІЇ З ГЛОБАЛЬНОЇ ПАМ'ЯТІ
    const { score, addScore, incrementAction } = useProgress();

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    // ==========================================
    // ОНОВЛЮЄМО ЖЕСТИ (додаємо incrementAction)
    // ==========================================

    const panGesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
            contextY.value = translateY.value;
        })
        .onUpdate((event) => {
            translateX.value = contextX.value + event.translationX;
            translateY.value = contextY.value + event.translationY;
        })
        .onEnd(() => {
            // Рахуємо перетягування
            runOnJS(incrementAction)('drags');
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = savedScale.value * event.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            runOnJS(addScore)(3);
            runOnJS(incrementAction)('pinches'); // Рахуємо масштабування
        });

    const swipeRight = Gesture.Fling()
        .direction(Directions.RIGHT)
        .runOnJS(true)
        .onEnd(() => {
            const randomPoints = Math.floor(Math.random() * 10) + 1;
            addScore(randomPoints);
            incrementAction('swipeRights'); // Рахуємо свайпи вправо
        });

    const swipeLeft = Gesture.Fling()
        .direction(Directions.LEFT)
        .runOnJS(true)
        .onEnd(() => {
            const randomPoints = Math.floor(Math.random() * 10) + 1;
            addScore(randomPoints);
            incrementAction('swipeLefts'); // Рахуємо свайпи вліво
        });

    const singleTap = Gesture.Tap().runOnJS(true).onEnd(() => {
        addScore(1);
        incrementAction('singleTaps'); // Рахуємо кліки
    });

    const doubleTap = Gesture.Tap().numberOfTaps(2).runOnJS(true).onEnd(() => {
        addScore(2);
        incrementAction('doubleTaps'); // Рахуємо подвійні кліки
    });

    const longPress = Gesture.LongPress().minDuration(3000).runOnJS(true).onEnd(() => {
        addScore(10);
        incrementAction('longPresses'); // Рахуємо довгі натискання
        Alert.alert("Супер!", "Ти отримала 10 бонусних очок!");
    });

    const combinedGestures = Gesture.Simultaneous(
        panGesture,
        pinchGesture,
        Gesture.Exclusive(swipeRight, swipeLeft, doubleTap, singleTap),
        longPress
    );

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    return (
        <View className="flex-1 items-center justify-center bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <View className="absolute top-16 items-center">
                <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Score
                </Text>
                {/* Рахунок тепер береться з глобального контексту */}
                <Text className="text-7xl font-bold text-blue-500">
                    {score}
                </Text>
            </View>

            <GestureDetector gesture={combinedGestures}>
                <Animated.View
                    style={[animatedStyle]}
                    className="w-48 h-48 bg-blue-500 rounded-full items-center justify-center shadow-2xl active:opacity-80 dark:bg-blue-600"
                >
                    <Text className="text-white text-2xl font-bold">TAP ME</Text>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}