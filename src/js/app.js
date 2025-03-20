/**
 * Meditime - Meditation Timer App
 * Main application logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize app
    initApp();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize the application
 */
function initApp() {
    // Show default view (dashboard)
    showView('dashboard');
    
    // Initialize theme from storage
    initTheme();
    
    // Load user data
    loadUserData();
}

/**
 * Set up event listeners for navigation and theme toggling
 */
function setupEventListeners() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Show corresponding view
            const targetView = item.getAttribute('data-target');
            showView(targetView);
        });
    });
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Quick start button
    const quickStartBtn = document.getElementById('quick-start-btn');
    quickStartBtn.addEventListener('click', () => {
        // Navigate to timer view
        showView('timer-container');
        navItems.forEach(navItem => {
            if (navItem.getAttribute('data-target') === 'timer-container') {
                navItem.classList.add('active');
            } else {
                navItem.classList.remove('active');
            }
        });
        
        // Start timer with previous settings
        startTimerWithLastSettings();
    });
}

/**
 * Show a specific view and hide others
 * @param {string} viewId - ID of the view to show
 */
function showView(viewId) {
    const views = ['dashboard', 'timer-container', 'calendar-view'];
    
    views.forEach(view => {
        const element = document.getElementById(view);
        if (view === viewId) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}

/**
 * Initialize theme from storage
 */
function initTheme() {
    const isDarkTheme = localStorage.getItem('dark-theme') === 'true';
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        document.querySelector('.theme-toggle i').classList.remove('fa-moon');
        document.querySelector('.theme-toggle i').classList.add('fa-sun');
    }
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    localStorage.setItem('dark-theme', isDarkTheme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (isDarkTheme) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

/**
 * Load user data from local storage
 */
function loadUserData() {
    // Load and display statistics
    const totalMinutes = getTotalMinutesMeditated();
    const currentStreak = getCurrentStreak();
    const longestStreak = getLongestStreak();
    
    document.getElementById('total-minutes').textContent = totalMinutes;
    document.getElementById('current-streak').textContent = `${currentStreak} days`;
    document.getElementById('longest-streak').textContent = `${longestStreak} days`;
}

/**
 * Start timer with last used settings
 */
function startTimerWithLastSettings() {
    const lastSettings = getLastTimerSettings();
    
    // Apply last duration
    const durationSlider = document.getElementById('duration-slider');
    const durationInput = document.getElementById('duration-input');
    
    durationSlider.value = lastSettings.duration;
    durationInput.value = lastSettings.duration;
    
    // Apply last interval chime setting
    const intervalSelect = document.getElementById('interval-select');
    intervalSelect.value = lastSettings.interval;
    
    // Apply last sound settings
    const soundItems = document.querySelectorAll('.sound-item');
    soundItems.forEach(item => {
        const soundName = item.getAttribute('data-sound');
        const volumeSlider = item.querySelector('.volume-slider');
        
        if (lastSettings.sounds && lastSettings.sounds[soundName]) {
            item.classList.add('active');
            volumeSlider.value = lastSettings.sounds[soundName].volume;
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update timer display
    updateTimerDisplay(lastSettings.duration * 60);
    
    // If quick-start was clicked, start the timer automatically
    if (event && event.target.id === 'quick-start-btn') {
        startTimer();
    }
}
