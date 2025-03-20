/**
 * Meditime - Meditation Timer
 * Handles timer functionality
 */

// Timer variables
let timerDuration = 0;
let remainingTime = 0;
let timerInterval = null;
let intervalChime = 0;
let lastIntervalCheck = 0;

// DOM Elements
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const durationSlider = document.getElementById('duration-slider');
const durationInput = document.getElementById('duration-input');
const timerMinutes = document.getElementById('minutes');
const timerSeconds = document.getElementById('seconds');
const intervalSelect = document.getElementById('interval-select');

// Initialize timer functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeTimer();
});

/**
 * Initialize timer functionality
 */
function initializeTimer() {
    // Sync duration slider and input
    durationSlider.addEventListener('input', () => {
        durationInput.value = durationSlider.value;
        updateTimerDisplay(durationSlider.value * 60);
    });
    
    durationInput.addEventListener('input', () => {
        const value = parseInt(durationInput.value);
        if (value >= 1 && value <= 120) {
            durationSlider.value = value;
            updateTimerDisplay(value * 60);
        }
    });
    
    // Set up timer control buttons
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', stopTimer);
    
    // Set up interval chime selection
    intervalSelect.addEventListener('change', () => {
        intervalChime = parseInt(intervalSelect.value);
    });
    
    // Initialize timer display
    updateTimerDisplay(durationSlider.value * 60);
}

/**
 * Start the meditation timer
 */
function startTimer() {
    // Get duration and interval settings
    timerDuration = parseInt(durationSlider.value) * 60; // Convert to seconds
    remainingTime = timerDuration;
    intervalChime = parseInt(intervalSelect.value);
    lastIntervalCheck = timerDuration;
    
    // Save current settings
    saveTimerSettings();
    
    // Start sounds
    startSelectedSounds();
    
    // Create interval to update timer every second
    timerInterval = setInterval(updateTimer, 1000);
    
    // Update UI buttons
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
}

/**
 * Pause the meditation timer
 */
function pauseTimer() {
    clearInterval(timerInterval);
    pauseAllSounds();
    
    // Update UI buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

/**
 * Stop the meditation timer
 */
function stopTimer() {
    clearInterval(timerInterval);
    
    // If we've meditated for at least 1 minute, save the session
    if (timerDuration - remainingTime >= 60) {
        saveMeditationSession(Math.floor((timerDuration - remainingTime) / 60));
    }
    
    // Stop and reset sounds
    stopAllSounds();
    
    // Reset timer
    updateTimerDisplay(timerDuration);
    
    // Update UI buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
}

/**
 * Update timer on each interval tick
 */
function updateTimer() {
    remainingTime--;
    
    // Check for interval chimes
    if (intervalChime > 0) {
        const currentMinuteRemaining = Math.floor(remainingTime / 60);
        const previousMinuteRemaining = Math.floor(lastIntervalCheck / 60);
        
        // If we've passed a minute mark that's divisible by the interval
        if (currentMinuteRemaining < previousMinuteRemaining && 
            previousMinuteRemaining % intervalChime === 0) {
            playIntervalChime();
        }
        
        lastIntervalCheck = remainingTime;
    }
    
    if (remainingTime <= 0) {
        // Timer completed
        clearInterval(timerInterval);
        playEndChime();
        fadeOutSounds(() => {
            stopAllSounds();
            saveMeditationSession(Math.floor(timerDuration / 60));
            
            // Update UI buttons
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            
            // Show completion message
            showCompletionMessage();
        });
        return;
    }
    
    // Update timer display
    updateTimerDisplay(remainingTime);
}

/**
 * Update timer display with the given time in seconds
 * @param {number} timeInSeconds - Time to display in seconds
 */
function updateTimerDisplay(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    
    timerMinutes.textContent = minutes.toString().padStart(2, '0');
    timerSeconds.textContent = seconds.toString().padStart(2, '0');
}

/**
 * Save current timer settings to local storage
 */
function saveTimerSettings() {
    const settings = {
        duration: parseInt(durationSlider.value),
        interval: intervalChime,
        sounds: getActiveSoundSettings()
    };
    
    localStorage.setItem('timer-settings', JSON.stringify(settings));
}

/**
 * Get last used timer settings from local storage
 * @returns {Object} Timer settings object
 */
function getLastTimerSettings() {
    const defaultSettings = {
        duration: 10,
        interval: 0,
        sounds: {
            rain: { active: false, volume: 70 }
        }
    };
    
    const savedSettings = localStorage.getItem('timer-settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
}

/**
 * Show meditation completion message
 */
function showCompletionMessage() {
    // Simple completion message - in a full app this could be a modal
    alert(`Meditation completed! You meditated for ${Math.floor(timerDuration / 60)} minutes.`);
}
