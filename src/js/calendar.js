/**
 * Meditime - Calendar and Progress Tracking
 * Handles progress visualization and calendar display
 */

// Current date for calendar view
let currentCalendarDate = new Date();

// DOM Elements
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthDisplay = document.getElementById('current-month-display');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

// Initialize calendar functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
});

/**
 * Initialize calendar view and controls
 */
function initializeCalendar() {
    // Set up navigation buttons
    prevMonthBtn.addEventListener('click', () => {
        navigateMonth(-1);
    });
    
    nextMonthBtn.addEventListener('click', () => {
        navigateMonth(1);
    });
    
    // Generate initial calendar view
    generateCalendarForMonth(currentCalendarDate);
}

/**
 * Navigate to previous or next month
 * @param {number} direction - -1 for previous, 1 for next month
 */
function navigateMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    generateCalendarForMonth(currentCalendarDate);
}

/**
 * Generate and display the calendar for a specific month
 * @param {Date} date - Date object for the month to display
 */
function generateCalendarForMonth(date) {
    // Clear the calendar grid
    calendarGrid.innerHTML = '';
    
    // Update month display
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    currentMonthDisplay.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();
    
    // Get the last day of the previous month
    const lastDayOfPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();
    
    // Get meditated days for the current month
    const meditatedDays = getMeditatedDaysForMonth(date.getFullYear(), date.getMonth());
    
    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === date.getFullYear() && today.getMonth() === date.getMonth();
    
    // Add days from previous month to fill first week
    for (let i = 0; i < startingDayOfWeek; i++) {
        const dayNumber = daysInPrevMonth - startingDayOfWeek + i + 1;
        addDayToCalendar(dayNumber, 'calendar-day other-month', false);
    }
    
    // Add days for current month
    for (let i = 1; i <= totalDaysInMonth; i++) {
        const isToday = isCurrentMonth && today.getDate() === i;
        const hasMeditated = meditatedDays.includes(i);
        
        let className = 'calendar-day';
        if (isToday) className += ' today';
        if (hasMeditated) className += ' meditated';
        
        addDayToCalendar(i, className, hasMeditated);
    }
    
    // Add days from next month to complete the grid
    const totalCells = 42; // 6 rows of 7 days
    const remainingCells = totalCells - (startingDayOfWeek + totalDaysInMonth);
    
    for (let i = 1; i <= remainingCells; i++) {
        addDayToCalendar(i, 'calendar-day other-month', false);
    }
}

/**
 * Add a day element to the calendar grid
 * @param {number} dayNumber - Day of the month
 * @param {string} className - CSS class name for the day element
 * @param {boolean} hasMeditated - Whether meditation was done on this day
 */
function addDayToCalendar(dayNumber, className, hasMeditated) {
    const dayElement = document.createElement('div');
    dayElement.className = className;
    dayElement.textContent = dayNumber;
    
    // Add meditation indicator or custom styling
    if (hasMeditated) {
        dayElement.title = 'Meditated on this day';
    }
    
    calendarGrid.appendChild(dayElement);
}

/**
 * Get the days in a specific month where meditation was done
 * @param {number} year - Year (e.g., 2025)
 * @param {number} month - Month (0-11)
 * @returns {Array} Array of day numbers with meditation sessions
 */
function getMeditatedDaysForMonth(year, month) {
    const meditationHistory = getMeditationHistory();
    const daysWithSessions = [];
    
    // Format date string for comparison (YYYY-MM)
    const monthStr = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    
    // Find all sessions for the specified month
    Object.keys(meditationHistory).forEach(dateKey => {
        if (dateKey.startsWith(monthStr)) {
            const day = parseInt(dateKey.split('-')[2]);
            daysWithSessions.push(day);
        }
    });
    
    return daysWithSessions;
}

/**
 * Save a new meditation session
 * @param {number} durationMinutes - Duration of session in minutes
 */
function saveMeditationSession(durationMinutes) {
    if (!durationMinutes || durationMinutes <= 0) return;
    
    const now = new Date();
    const dateKey = formatDateKey(now);
    
    const meditationHistory = getMeditationHistory();
    
    // If entry for this day exists, add to it, otherwise create new entry
    if (meditationHistory[dateKey]) {
        meditationHistory[dateKey].totalMinutes += durationMinutes;
        meditationHistory[dateKey].sessions += 1;
    } else {
        meditationHistory[dateKey] = {
            totalMinutes: durationMinutes,
            sessions: 1
        };
    }
    
    // Save updated history
    localStorage.setItem('meditation-history', JSON.stringify(meditationHistory));
    
    // Update statistics
    updateStatistics();
    
    // Update calendar if we're on the calendar view
    if (document.getElementById('calendar-view').classList.contains('active')) {
        generateCalendarForMonth(currentCalendarDate);
    }
}

/**
 * Format date as YYYY-MM-DD for storage key
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Update streak and total minutes statistics
 */
function updateStatistics() {
    const totalMinutes = getTotalMinutesMeditated();
    const currentStreak = getCurrentStreak();
    const longestStreak = getLongestStreak();
    
    document.getElementById('total-minutes').textContent = totalMinutes;
    document.getElementById('current-streak').textContent = `${currentStreak} days`;
    document.getElementById('longest-streak').textContent = `${longestStreak} days`;
}
