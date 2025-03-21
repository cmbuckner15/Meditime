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

// J Mode special sound
const jModeSoundPath = 'src/assets/sounds/Hyperdrive Boogie 4.mp3';
let jModeSoundElement = null;
let jModeActive = false;

// Active video tracking
let currentMode = 'normal';
// Track active sounds to restore after video switch
let activeSounds = {};

// Initialize video functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeBackgroundVideo();
    initializeJModeToggle();
    initializeJModeSound();
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
 * Initialize J Mode sound
 */
function initializeJModeSound() {
    try {
        // Create J Mode sound element
        jModeSoundElement = new Audio();
        // URL encode the path to handle spaces in filename
        jModeSoundElement.src = encodeURI(jModeSoundPath);
        jModeSoundElement.loop = true;
        jModeSoundElement.volume = 0.7;
        jModeSoundElement.preload = 'auto';
        
        // Force load
        jModeSoundElement.load();
        
        jModeSoundElement.addEventListener('canplaythrough', () => {
            console.log('J Mode sound loaded successfully');
        });
        
        jModeSoundElement.addEventListener('error', (e) => {
            console.error('Error loading J Mode sound:', e);
            console.error('Error code:', e.target.error ? e.target.error.code : 'unknown');
            console.error('Source:', e.target.src);
            
            // Try reload with timestamp to avoid cache issues
            const timestamp = new Date().getTime();
            jModeSoundElement.src = encodeURI(`${jModeSoundPath}?t=${timestamp}`);
            jModeSoundElement.load();
        });
        
        console.log('J Mode sound initialized');
    } catch (e) {
        console.error('Error initializing J Mode sound:', e);
    }
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
            activateJMode();
        } else {
            // Switch back to normal mode
            deactivateJMode();
        }
    });
    
    console.log("J Mode toggle initialized");
}

/**
 * Activate J Mode - change video and play special sound
 */
function activateJMode() {
    jModeActive = true;
    
    // Switch video source to JeffMode
    switchVideoSource('jeffMode');
    console.log("J Mode activated");
    
    // Stop all regular sounds and deselect sound items
    if (typeof stopAllSounds === 'function') {
        stopAllSounds();
    } else {
        // Fallback if stopAllSounds isn't available
        deselectAllSoundItems();
    }
    
    // Play the J Mode special sound
    playJModeSound();
}

/**
 * Deactivate J Mode - restore normal video and stop special sound
 */
function deactivateJMode() {
    jModeActive = false;
    
    // Switch video source to normal
    switchVideoSource('normal');
    console.log("J Mode deactivated");
    
    // Stop the J Mode sound
    stopJModeSound();
}

/**
 * Play the J Mode special sound
 */
function playJModeSound() {
    console.log("Attempting to play J Mode sound");
    
    if (!jModeSoundElement) {
        console.error("J Mode sound element not initialized");
        initializeJModeSound();
        
        // If still not initialized, return
        if (!jModeSoundElement) {
            return;
        }
    }
    
    try {
        // Ensure user interaction flag is set
        window.userHasInteracted = true;
        
        // Reset sound position if it was played before
        if (jModeSoundElement.currentTime > 0) {
            jModeSoundElement.currentTime = 0;
        }
        
        // Play the sound with a slight delay to ensure video has loaded
        setTimeout(() => {
            const playPromise = jModeSoundElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("J Mode sound playing successfully");
                }).catch(error => {
                    console.error("Error playing J Mode sound:", error);
                    
                    // If it's an autoplay restriction
                    if (error.name === 'NotAllowedError') {
                        console.log("J Mode sound needs user interaction");
                        // Create a special button just for J Mode sound
                        showJModeSoundButton();
                    } else {
                        // Try reloading the sound
                        reloadJModeSound();
                    }
                });
            }
        }, 300);
    } catch (e) {
        console.error("Error playing J Mode sound:", e);
        // Try reloading the sound
        reloadJModeSound();
    }
}

/**
 * Show button to enable J Mode sound
 */
function showJModeSoundButton() {
    if (document.getElementById('enable-jmode-sound-btn')) {
        return;
    }
    
    const btn = document.createElement('button');
    btn.id = 'enable-jmode-sound-btn';
    btn.textContent = 'Enable J Mode Sound';
    btn.className = 'btn primary-btn';
    btn.style.position = 'fixed';
    btn.style.top = '110px';
    btn.style.right = '10px';
    btn.style.zIndex = '9999';
    
    btn.addEventListener('click', () => {
        window.userHasInteracted = true;
        
        reloadJModeSound();
        
        // Remove button after clicking
        document.body.removeChild(btn);
    });
    
    document.body.appendChild(btn);
}

/**
 * Reload J Mode sound as a fallback
 */
function reloadJModeSound() {
    console.log("Using fallback method to play J Mode sound");
    try {
        // Create a new audio element
        const timestamp = new Date().getTime();
        const newJModeAudio = new Audio(encodeURI(`${jModeSoundPath}?t=${timestamp}`));
        newJModeAudio.loop = true;
        newJModeAudio.volume = 0.7;
        
        // Replace the existing audio element
        jModeSoundElement = newJModeAudio;
        
        // Play the sound
        newJModeAudio.play()
            .then(() => {
                console.log("J Mode sound playing successfully with fallback method");
            })
            .catch(error => {
                console.error("Fallback J Mode sound play failed:", error);
                
                // Last resort - show an error message
                alert("Could not play J Mode sound. Try clicking somewhere on the page first.");
            });
    } catch (e) {
        console.error("Fallback J Mode sound play error:", e);
    }
}

/**
 * Stop the J Mode special sound
 */
function stopJModeSound() {
    if (!jModeSoundElement) {
        return;
    }
    
    try {
        jModeSoundElement.pause();
        jModeSoundElement.currentTime = 0;
        console.log("J Mode sound stopped");
    } catch (e) {
        console.error("Error stopping J Mode sound:", e);
    }
}

/**
 * Deselect all sound items in the UI
 */
function deselectAllSoundItems() {
    const soundItems = document.querySelectorAll('.sound-item');
    
    soundItems.forEach(item => {
        item.classList.remove('active');
        
        // Stop the corresponding audio if available
        const soundName = item.getAttribute('data-sound');
        if (typeof stopSound === 'function' && soundName) {
            stopSound(soundName);
        }
    });
    
    console.log("All sound items deselected");
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
        
        // Pause any playing sounds (we'll resume them later if not in J Mode)
        if (typeof pauseAllSounds === 'function' && !jModeActive) {
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
            
            // Restore sounds after video has loaded, but only if not in J Mode
            if (!jModeActive) {
                setTimeout(() => {
                    restoreSoundsAfterVideoSwitch();
                }, 300);
            }
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
    // Don't restore regular sounds if in J Mode
    if (jModeActive) {
        return;
    }
    
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
                
                // If in J Mode, also play the J Mode sound
                if (jModeActive) {
                    playJModeSound();
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
            
            // Also resume J Mode sound if we're in J Mode
            if (jModeActive && jModeSoundElement && jModeSoundElement.paused) {
                playJModeSound();
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
            
            // Also pause J Mode sound if it's playing
            if (jModeActive && jModeSoundElement && !jModeSoundElement.paused) {
                jModeSoundElement.pause();
            }
        });
    }
    
    // Handle timer stop
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            // Restart video from beginning
            backgroundVideo.currentTime = 0;
            backgroundVideo.pause();
            
            // Also stop J Mode sound
            if (jModeActive && jModeSoundElement) {
                stopJModeSound();
            }
        });
    }
}
