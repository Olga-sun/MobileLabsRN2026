import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import DatePicker from 'react-native-date-picker';

const ONESIGNAL_APP_ID = "bc8cd16c-ec88-441e-9178-b0125e66523f";
const REST_API_KEY = "os_v2_app_xsgnc3hmrbcb5elywajf4zssh4gadcblwpbei75ty5zmdetxktze7myctiol6ntjv35kctznaj3q6kgwwrw3uwlozobkurci57hcjli";

interface Task {
    id: string;
    title: string;
    description: string;
    date: string;
    notificationId: string | null;
}

export default function App() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState(false);

    useEffect(() => {
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        OneSignal.initialize(ONESIGNAL_APP_ID);

        // Запитуємо дозвіл і примусово підписуємо пристрій
        OneSignal.Notifications.requestPermission(true).then((granted) => {
            console.log("Дозвіл на сповіщення:", granted);
        });
        OneSignal.User.pushSubscription.optIn();
    }, []);

    const scheduleNotification = async (taskTitle: string, taskDesc: string, sendAfterDate: Date) => {
        const url = 'https://api.onesignal.com/notifications?c=push';
        try {
            // Примусово беремо найсвіжіший ID підписки прямо перед відправкою!
            const freshId = await OneSignal.User.pushSubscription.getIdAsync();
            console.log("Мій свіжий ID підписки:", freshId);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${REST_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    app_id: ONESIGNAL_APP_ID,
                    contents: { en: taskDesc },
                    headings: { en: taskTitle },
                    include_player_ids: freshId ? [freshId] : [], // Відправляємо чітко на цей телефон
                    target_channel: "push",
                    send_after: sendAfterDate.toISOString(),
                }),
            });
            const result = await response.json();
            console.log('Відповідь OneSignal:', result);
            return result.id;
        } catch (error) {
            console.error('Помилка:', error);
            return null;
        }
    };

    const cancelNotification = async (notificationId: string) => {
        const url = `https://api.onesignal.com/notifications/${notificationId}?app_id=${ONESIGNAL_APP_ID}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Basic ${REST_API_KEY}` }
            });
            console.log('Результат скасування:', await response.json());
        } catch (error) {
            console.error('Помилка скасування:', error);
        }
    };

    const handleAddTask = async () => {
        if (!title) return Alert.alert('Помилка', 'Введіть назву');

        const notificationId = await scheduleNotification(title, description, date);
        const newTask: Task = { id: Date.now().toString(), title, description, date: date.toString(), notificationId };

        setTasks([...tasks, newTask]);
        setTitle('');
    };

    const handleDeleteTask = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task?.notificationId) cancelNotification(task.notificationId);
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>To-Do Reminder</Text>
            <TextInput style={styles.input} placeholder="Назва" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Опис" value={description} onChangeText={setDescription} />

            <TouchableOpacity style={styles.dateButton} onPress={() => setOpenDatePicker(true)}>
                <Text>Обрати час: {date.toLocaleString()}</Text>
            </TouchableOpacity>

            <DatePicker modal open={openDatePicker} date={date} onConfirm={(selectedDate: Date) => { setOpenDatePicker(false); setDate(selectedDate); }} onCancel={() => { setOpenDatePicker(false); }} />

            <Button title="ДОДАТИ НАГАДУВАННЯ" onPress={handleAddTask} />

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                style={{ marginTop: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.taskCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.taskTitle}>{item.title}</Text>
                            <Text>{item.description}</Text>
                            <Text style={styles.taskDate}>{new Date(item.date).toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.deleteBtn}>
                            <Text style={{ color: 'white' }}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f5f5f5' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: 'white', padding: 10, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
    dateButton: { backgroundColor: 'white', padding: 15, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    taskCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, alignItems: 'center' },
    taskTitle: { fontWeight: 'bold', fontSize: 16 },
    taskDate: { color: 'gray', fontSize: 12, marginTop: 5 },
    deleteBtn: { backgroundColor: '#ff4444', padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }
});