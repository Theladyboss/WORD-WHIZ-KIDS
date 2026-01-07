export interface AssessmentResult {
    id: string;
    studentId: string;
    studentName: string;
    timestamp: number;
    mode: string;
    question: string; // The word or question asked
    isCorrect: boolean;
    attempts: number;
    score: number; // e.g., 10 for first try, 5 for second
}

const STORAGE_KEY = 'word-whiz-assessments';

export const AssessmentSystem = {
    // Save a new result
    saveResult: (result: Omit<AssessmentResult, 'id' | 'timestamp'>) => {
        const records = AssessmentSystem.getAllRecords();
        const newRecord: AssessmentResult = {
            ...result,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };
        records.push(newRecord);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return newRecord;
    },

    // Get all records
    getAllRecords: (): AssessmentResult[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Get stats for a specific student
    getStudentStats: (studentName: string) => {
        const records = AssessmentSystem.getAllRecords().filter(r => r.studentName === studentName);
        const total = records.length;
        const correct = records.filter(r => r.isCorrect).length;
        const score = records.reduce((acc, r) => acc + r.score, 0);

        // Group by mode
        const byMode: Record<string, { total: number, correct: number }> = {};
        records.forEach(r => {
            if (!byMode[r.mode]) byMode[r.mode] = { total: 0, correct: 0 };
            byMode[r.mode].total++;
            if (r.isCorrect) byMode[r.mode].correct++;
        });

        return { total, correct, score, byMode, records };
    },

    // Clear all data (Teacher only)
    clearData: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STATUS_KEY);
    },

    // --- Live Status Tracking ---
    updateStatus: (studentName: string, mode: string, action: string) => {
        const statuses = AssessmentSystem.getAllStatuses();
        statuses[studentName] = {
            mode,
            action,
            lastActive: Date.now()
        };
        localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
    },

    getAllStatuses: (): Record<string, { mode: string, action: string, lastActive: number }> => {
        const data = localStorage.getItem(STATUS_KEY);
        return data ? JSON.parse(data) : {};
    }
};

const STATUS_KEY = 'word-whiz-student-status';
