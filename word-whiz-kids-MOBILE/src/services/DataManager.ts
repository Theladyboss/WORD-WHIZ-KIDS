export interface StudentProgress {
    digraph: { completedWords: string[], stars: number };
    spell: { completedWords: string[], stars: number };
    syllable: { completedWords: string[], stars: number };
    schwa: { completedWords: string[], stars: number };
    vce: { completedWords: string[], stars: number };
    story: { completedStories: number, stars: number };
    // Add other modes as needed
}

export interface StudentData {
    pin: string;
    name: string;
    progress: StudentProgress;
    lastActive: string;
}

const DEFAULT_PROGRESS: StudentProgress = {
    digraph: { completedWords: [], stars: 0 },
    spell: { completedWords: [], stars: 0 },
    syllable: { completedWords: [], stars: 0 },
    schwa: { completedWords: [], stars: 0 },
    vce: { completedWords: [], stars: 0 },
    story: { completedStories: 0, stars: 0 }
};

class DataManager {
    private storageKey = 'word_whiz_kids_data';

    constructor() {
        // Initialize if empty
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({}));
        }
    }

    private getAllData(): Record<string, StudentData> {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch (e) {
            return {};
        }
    }

    private saveData(data: Record<string, StudentData>) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    getStudentData(pin: string): StudentData | null {
        const allData = this.getAllData();
        return allData[pin] || null;
    }

    initStudent(pin: string, name: string): StudentData {
        const allData = this.getAllData();
        if (!allData[pin]) {
            allData[pin] = {
                pin,
                name,
                progress: { ...DEFAULT_PROGRESS },
                lastActive: new Date().toISOString()
            };
            this.saveData(allData);
        }
        return allData[pin];
    }

    updateProgress(pin: string, mode: keyof StudentProgress, wordOrItem: string) {
        const allData = this.getAllData();
        const student = allData[pin];
        if (!student) return;

        if (mode === 'story') {
            student.progress.story.completedStories += 1;
            student.progress.story.stars += 1;
        } else {
            // For word-based modes
            const modeData = student.progress[mode];
            if (modeData && !modeData.completedWords.includes(wordOrItem)) {
                modeData.completedWords.push(wordOrItem);
                modeData.stars += 1; // Simple logic: 1 star per word
            }
        }

        student.lastActive = new Date().toISOString();
        this.saveData(allData);
    }

    // For future Firebase integration
    async syncWithCloud() {
        console.log("Syncing with cloud... (Mock)");
        // TODO: Implement Firebase sync
    }
}

export const dataManager = new DataManager();
