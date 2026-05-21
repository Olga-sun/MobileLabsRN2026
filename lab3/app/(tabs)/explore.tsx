import { View, Text, ScrollView } from 'react-native';
import { useProgress } from '../../context/ProgressContext';

export default function ChallengesScreen() {
    // Дістаємо всі наші збережені лічильники з глобальної пам'яті
    const {
        score, singleTaps, doubleTaps, longPresses, drags,
        swipeRights, swipeLefts, pinches
    } = useProgress();

    // Створюємо масив завдань згідно з вимогами лабораторної роботи.
    // Останнє завдання - твоє власне (кастомне).
    const challenges = [
        { id: 1, title: 'Зробити 10 кліків', current: singleTaps, target: 10 },
        { id: 2, title: 'Зробити подвійний клік 5 разів', current: doubleTaps, target: 5 },
        { id: 3, title: 'Утримувати об\'єкт 3 секунди', current: longPresses, target: 1 },
        { id: 4, title: 'Перетягнути об\'єкт', current: drags, target: 1 },
        { id: 5, title: 'Зробити свайп вправо', current: swipeRights, target: 1 },
        { id: 6, title: 'Зробити свайп вліво', current: swipeLefts, target: 1 },
        { id: 7, title: 'Змінити розмір об\'єкта', current: pinches, target: 1 },
        { id: 8, title: 'Отримати 100 очок', current: score, target: 100 },
        // Твоє власне додаткове завдання:
        { id: 9, title: 'Набрати 250 очок', current: score, target: 250 },
    ];

    return (
        // ScrollView дозволяє гортати список, якщо він не поміщається на екрані
        <ScrollView className="flex-1 bg-slate-100 dark:bg-slate-900 p-4">
            <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-6 mt-12 pl-2">
                Challenges
            </Text>

            {/* Проходимося по масиву завдань і малюємо картку для кожного */}
            {challenges.map((challenge) => {
                const isCompleted = challenge.current >= challenge.target;
                // Обмежуємо прогрес, щоб він не показував більше ніж треба (напр. 15/10)
                const progress = Math.min(challenge.current, challenge.target);

                return (
                    <View
                        key={challenge.id}
                        className={`p-4 mb-3 rounded-2xl shadow-sm ${
                            isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800'
                        }`}
                    >
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className={`text-lg font-semibold ${
                                isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'
                            }`}>
                                {challenge.title}
                            </Text>
                            {/* Якщо виконано - показуємо галочку */}
                            {isCompleted && (
                                <Text className="text-lg">✅</Text>
                            )}
                        </View>

                        {/* Смуга прогресу (Progress Bar) */}
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-4">
                                <View
                                    className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${(progress / challenge.target) * 100}%` }}
                                />
                            </View>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium w-10 text-right">
                                {progress}/{challenge.target}
                            </Text>
                        </View>
                    </View>
                );
            })}
            {/* Додаємо трохи місця знизу, щоб останній елемент не перекривався меню */}
            <View className="h-10" />
        </ScrollView>
    );
}