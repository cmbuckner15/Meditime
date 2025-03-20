/**
 * Meditime - Data Storage
 * Handles local storage operations for the app
 */

/**
 * Retrieve meditation history from local storage
 * @returns {Object} Meditation history object
 */
function getMeditationHistory() {
    const history = localStorage.getItem('meditation-history');
    return history ? JSON.parse(history) : {};
}

/**
 * Calculate total minutes meditated
 * @returns {number} Total minutes
 */
function getTotalMinutesMeditated() {
    const history = getMeditationHistory();
    let total = 0;
    
    Object.values(history).forEach(day => {
        total += day.totalMinutes;
    });
    
    return total;
}

/**
 * Calculate current streak of consecutive days meditating
 * @returns {number} Current streak in days
 */
function getCurrentStreak() {
    const history = getMeditationHistory();
    const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
    
    if (sortedDates.length === 0) return 0;
    
    // Check if the latest meditation was today or yesterday
    const today = new Date();
    const latestMeditationDate = new Date(sortedDates[0]);
    
    // If the latest meditation day is before yesterday, streak is broken
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    if (latestMeditationDate < yesterday) {
        return 0;
    }
    
    // Count streak days by checking consecutive days backwards
    let streak = 1;
    const oneDayMs = 24 * 60 * 60 * 1000; // milliseconds in a day
    
    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i - 1]);
        const prevDate = new Date(sortedDates[i]);
        
        // Reset date times to beginning of day for comparison
        currentDate.setHours(0, 0, 0, 0);
        prevDate.setHours(0, 0, 0, 0);
        
        // Check if dates are consecutive
        const daysDifference = Math.round((currentDate - prevDate) / oneDayMs);
        
        if (daysDifference === 1) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

/**
 * Calculate longest streak of consecutive days meditating
 * @returns {number} Longest streak in days
 */
function getLongestStreak() {
    const history = getMeditationHistory();
    const dates = Object.keys(history).map(dateStr => new Date(dateStr));
    
    if (dates.length === 0) return 0;
    
    // Sort dates in ascending order
    dates.sort((a, b) => a - b);
    
    let currentStreak = 1;
    let longestStreak = 1;
    const oneDayMs = 24 * 60 * 60 * 1000; // milliseconds in a day
    
    for (let i = 1; i < dates.length; i++) {
        const currentDate = dates[i];
        const prevDate = dates[i - 1];
        
        // Reset date times to beginning of day for comparison
        currentDate.setHours(0, 0, 0, 0);
        prevDate.setHours(0, 0, 0, 0);
        
        // Check if dates are consecutive
        const daysDifference = Math.round((currentDate - prevDate) / oneDayMs);
        
        if (daysDifference === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else if (daysDifference > 1) {
            currentStreak = 1;
        }
    }
    
    return longestStreak;
}

/**
 * Clear all app data (for testing or reset purposes)
 */
function clearAllData() {
    localStorage.removeItem('meditation-history');
    localStorage.removeItem('timer-settings');
    localStorage.removeItem('dark-theme');
    
    // Reload to refresh UI
    window.location.reload();
}
