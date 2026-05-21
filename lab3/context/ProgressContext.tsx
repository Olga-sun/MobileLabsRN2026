import { createContext, useState, useContext, ReactNode } from 'react';

// Описуємо, які дані ми будемо зберігати
interface ProgressState {
    score: number;
    singleTaps: number;
    doubleTaps: number;
    longPresses: number;
    drags: number;
    swipeRights: number;
    swipeLefts: number;
    pinches: number;
    addScore: (points: number) => void;
    incrementAction: (action: keyof Omit<ProgressState, 'score' | 'addScore' | 'incrementAction'>) => void;
}

// Створюємо сам контекст
const ProgressContext = createContext<ProgressState | undefined>(undefined);

// Створюємо "Провайдер", який буде обгортати наш додаток і роздавати дані
export function ProgressProvider({ children }: { children: ReactNode }) {
    const [score, setScore] = useState(0);
    const [singleTaps, setSingleTaps] = useState(0);
    const [doubleTaps, setDoubleTaps] = useState(0);
    const [longPresses, setLongPresses] = useState(0);
    const [drags, setDrags] = useState(0);
    const [swipeRights, setSwipeRights] = useState(0);
    const [swipeLefts, setSwipeLefts] = useState(0);
    const [pinches, setPinches] = useState(0);

    const addScore = (points: number) => setScore((prev) => prev + points);

    // Універсальна функція для збільшення будь-якого лічильника
    const incrementAction = (action: keyof Omit<ProgressState, 'score' | 'addScore' | 'incrementAction'>) => {
        switch (action) {
            case 'singleTaps': setSingleTaps(prev => prev + 1); break;
            case 'doubleTaps': setDoubleTaps(prev => prev + 1); break;
            case 'longPresses': setLongPresses(prev => prev + 1); break;
            case 'drags': setDrags(prev => prev + 1); break;
            case 'swipeRights': setSwipeRights(prev => prev + 1); break;
            case 'swipeLefts': setSwipeLefts(prev => prev + 1); break;
            case 'pinches': setPinches(prev => prev + 1); break;
        }
    };

    return (
        <ProgressContext.Provider value={{
            score, singleTaps, doubleTaps, longPresses, drags, swipeRights, swipeLefts, pinches,
            addScore, incrementAction
        }}>
            {children}
        </ProgressContext.Provider>
    );
}

// Зручний хук для використання в інших файлах
export function useProgress() {
    const context = useContext(ProgressContext);
    if (!context) throw new Error('useProgress must be used within a ProgressProvider');
    return context;
}