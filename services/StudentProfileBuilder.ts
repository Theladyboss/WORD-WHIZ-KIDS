import { AssessmentSystem } from '../AssessmentSystem';
import { dataManager } from './DataManager';

export const StudentProfileBuilder = {
    /**
     * Builds a natural language summary of the student's recent progress and status.
     * This context is fed to the AI to generate personalized responses.
     */
    getStudentContext: (studentName: string, pin: string): string => {
        let context = `Student Name: ${studentName}. `;

        // 1. Get Long-term Progress (Stars & Completed Items) from DataManager
        const progressData = dataManager.getStudentData(pin);
        if (progressData) {
            const p = progressData.progress;
            const totalStars =
                p.digraph.stars + p.spell.stars + p.syllable.stars +
                p.schwa.stars + p.vce.stars + p.story.stars;

            context += `Total Stars Earned: ${totalStars}. `;

            // Highlight specific achievements
            if (p.story.completedStories > 0) {
                context += `Has written ${p.story.completedStories} stories. `;
            }
            if (p.digraph.completedWords.length > 5) {
                context += `Is doing great with Digraphs (${p.digraph.completedWords.length} words mastered). `;
            }
        } else {
            context += `This is a new student or first time logging in. `;
        }

        // 2. Get Recent Performance from AssessmentSystem
        // (Note: AssessmentSystem might not be available in all environments, so we try/catch or check)
        try {
            const stats = AssessmentSystem.getStudentStats(studentName);
            if (stats.total > 0) {
                const accuracy = Math.round((stats.correct / stats.total) * 100);
                context += `Recent Accuracy: ${accuracy}%. `;

                // Identify struggles (modes with low accuracy)
                const struggles: string[] = [];
                Object.entries(stats.byMode).forEach(([mode, data]) => {
                    if (data.total >= 3 && (data.correct / data.total) < 0.6) {
                        struggles.push(mode);
                    }
                });

                if (struggles.length > 0) {
                    context += `Recently struggled with: ${struggles.join(', ')}. Encourage them in these areas. `;
                } else if (accuracy > 90) {
                    context += `Doing excellent work recently! Challenge them more. `;
                }
            }
        } catch (e) {
            // AssessmentSystem might not be linked or available
            console.log('AssessmentSystem not available for context');
        }

        return context;
    }
};
