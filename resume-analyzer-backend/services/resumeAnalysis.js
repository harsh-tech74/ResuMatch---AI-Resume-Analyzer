
const sectionRules = [
    {
        name: "Education",
        pattern: /\beducation\b/i,
        suggestion: "Consider adding an Education section."
    },
    {
        name: "Skills",
        pattern: /\bskills?\b/i,
        suggestion: "Consider adding a Skills section."
    },
    {
        name: "Projects",
        pattern: /\bprojects?\b/i,
        suggestion: "Consider adding a Projects section."
    },
    {
        name: "Experience",
        pattern: /\b(experience|employment|internship)\b/i,
        suggestion: "Consider adding relevant work or internship experience if applicable."
    }
];

function analyzeResumeText(resumeText) {
    const text = resumeText.toLowerCase();

    const detectedSections = [];
    const suggestions = [];

    for (const rule of sectionRules) {
        if (rule.pattern.test(text)) {
            detectedSections.push(rule.name);
        } else {
            suggestions.push(rule.suggestion);
        }
    }

    const score = Math.round(
        (detectedSections.length / sectionRules.length) * 100
    );

    return {
        completenessScore: score,
        detectedSections,
        suggestions
    };
}

module.exports = { analyzeResumeText };
