/**
 * Meditime - Video Background Management
 * Handles automatic background video for meditation sessions
 */

// Video elements
const backgroundVideo = document.getElementById('background-video');
const videoOverlay = document.querySelector('.video-overlay');

// Video sources
const videoSources = {
    normal: 'src/assets/videos/BackgroundVideo.mp4',
    jeffMode: 'src/assets/videos/JeffMode.mp4'
};

// Active video tracking
let currentMode = 'normal';
// Track active sounds to restore after video switch
let activeSounds = {};

// Initialize video functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeBackgroundVideo();
    initializeJModeToggle();
});

/**
 * Initialize the background video
 */
function initializeBackgroundVideo() {
    // Try to play the video automatically
    try {
        const playPromise = backgroundVideo.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error(`Error playing background video: ${error.message}`);
                
                // Handle autoplay restrictions by showing a play button
                if (error.name === 'NotAllowedError') {
                    showPlayVideoButton();
                }
            });
        }
        
        console.log("Background video initialized");
    } catch (e) {
        console.error(`Error initializing background video: ${e.message}`);
    }
    
    // Add event listeners for timer controls to sync with video
    syncVideoWithTimerControls();
}

/**
 * Initialize J Mode toggle functionality
 */
function initializeJModeToggle() {
    const jModeToggle = document.getElementById('j-mode-toggle');
    
    if (!jModeToggle) {
        console.error("J Mode toggle not found");
        return;
    }
    
    // Set initial state
    jModeToggle.checked = false;
    
    // Add event listener for toggle change
    jModeToggle.addEventListener('change', function() {
        // Store the active sounds state before switching
        if (typeof getActiveSoundSettings === 'function') {
            activeSounds = getActiveSoundSettings();
        }
        
        if (this.checked) {
            // Switch to Jeff Mode
            switchVideoSource('jeffMode');
            console.log("J Mode activated");
        } else {
            // Switch back to normal mode
            switchVideoSource('normal');
            console.log("J Mode deactivated");
        }
    });
    
    console.log("J Mode toggle initialized");
}

/**
 * Switch the video source
 * @param {string} mode - The video mode to switch to ('normal' or 'jeffMode')
 */
function switchVideoSource(mode) {
    if (!videoSources[mode]) {
        console.error(`Video source for ${mode} not found`);
        return;
    }
    
    if (mode === currentMode) {
        console.log(`Already in ${mode} mode`);
        return;
    }
    
    try {
        // Store current time and paused state
        const wasPlaying = !backgroundVideo.paused;
        const currentTime = backgroundVideo.currentTime;
        
        // Pause any playing sounds (we'll resume them later)
        if (typeof pauseAllSounds === 'function') {
            pauseAllSounds();
        }
        
        // Update source
        const source = backgroundVideo.querySelector('source');
        source.src = videoSources[mode];
        
        // Update current mode
        currentMode = mode;
        
        // Reload and restore state
        backgroundVideo.load();
        
        backgroundVideo.onloadeddata = function() {
            // Try to set the current time to match previous position
            try {
                backgroundVideo.currentTime = currentTime;
            } catch (e) {
                console.warn("Could not set video time:", e);
            }
            
            // If it was playing before, resume playback
            if (wasPlaying) {
                const playPromise = backgroundVideo.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error(`Error resuming video: ${error.message}`);
                    });
                }
            }
            
            // Restore sounds after video has loaded
            setTimeout(() => {
                restoreSoundsAfterVideoSwitch();
            }, 300);
        };
        
        console.log(`Switched to ${mode} video`);
    } catch (e) {
        console.error(`Error switching video source: ${e.message}`);
    }
}

/**
 * Restore sounds after video switch
 */
function restoreSoundsAfterVideoSwitch() {
    if (typeof window.userHasInteracted !== 'undefined') {
        // Set the global interaction flag to true to maintain sounds
        window.userHasInteracted = true;
    }
    
    // Ensure we have active sounds and the function exists
    if (Object.keys(activeSounds).length > 0 && typeof startSelectedSounds === 'function') {
        // Resume any sounds that were playing
        Object.keys(activeSounds).forEach(sound => {
            if (activeSounds[sound].active && typeof playSound === 'function') {
                setTimeout(() => {
                    playSound(sound, activeSounds[sound].volume);
                    
                    // Re-mark the sound UI as active
                    const soundItem = document.querySelector(`.sound-item[data-sound="${sound}"]`);
                    if (soundItem) {
                        soundItem.classList.add('active');
                    }
                }, 100);
            }
        });
    }
}

/**
 * Show button to play video (for browsers with autoplay restrictions)
 */
function showPlayVideoButton() {
    if (document.getElementById('enable-video-btn')) {
        return;
    }
    
    const btn = document.createElement('button');
    btn.id = 'enable-video-btn';
    btn.textContent = 'Enable Background';
    btn.className = 'btn primary-btn';
    btn.style.position = 'fixed';
    btn.style.top = '10px';
    btn.style.left = '10px';
    btn.style.zIndex = '9999';
    
    btn.addEventListener('click', () => {
        backgroundVideo.play()
            .then(() => {
                console.log("Video playback started successfully");
                
                // Set global interaction flag
                if (typeof window.userHasInteracted !== 'undefined') {
                    window.userHasInteracted = true;
                }
            })
            .catch(error => {
                console.error(`Error playing video: ${error.message}`);
            });
        
        // Remove button after clicking
        document.body.removeChild(btn);
    });
    
    document.body.appendChild(btn);
}

/**
 * Sync video playback with meditation timer controls
 */
function syncVideoWithTimerControls() {
    // Get timer control buttons
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    
    // Handle timer start
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Resume video if paused
            if (backgroundVideo.paused) {
                backgroundVideo.play().catch(error => {
                    console.error(`Error playing video: ${error.message}`);
                });
            }
        });
    }
    
    // Handle timer pause
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            // Also pause video if it's playing
            if (!backgroundVideo.paused) {
                backgroundVideo.pause();
            }
        });
    }
    
    // Handle timer stop
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            // Restart video from beginning
            backgroundVideo.currentTime = 0;
            backgroundVideo.pause();
        });
    }
}
