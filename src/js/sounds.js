/**
 * Meditime - Sound Management
 * Handles background sounds and chimes
 */

// Sound objects storage
const audioElements = {};

// DOM Elements
let soundItems;

// Flag to track if user has interacted - making it available globally
window.userHasInteracted = false;

// Initialize sounds functionality
document.addEventListener('DOMContentLoaded', () => {
    soundItems = document.querySelectorAll('.sound-item');
    initializeSounds();
    
    // Create audio elements
    createAudioElements();
    
    // Log audio status to help with debugging
    console.log("Audio initialization complete. Available sounds:", Object.keys(audioElements));
    
    // Ensure the play button is shown if needed
    setTimeout(checkAutoplaySupport, 1000);
});

/**
 * Initialize sounds and their event listeners
 */
function initializeSounds() {
    // Mark user interaction on any click in the document
    document.addEventListener('click', function() {
        window.userHasInteracted = true;
        console.log("User interaction detected");
    }, { once: true });
    
    // Add event listeners to sound items
    soundItems.forEach(item => {
        const soundName = item.getAttribute('data-sound');
        const volumeSlider = item.querySelector('.volume-slider');
        
        // Toggle sound active state
        item.addEventListener('click', (event) => {
            // Ignore clicks on the volume slider itself
            if (event.target !== volumeSlider) {
                item.classList.toggle('active');
                console.log(`Sound ${soundName} ${item.classList.contains('active') ? 'activated' : 'deactivated'}`);
                
                // Start or stop the sound based on active state
                if (item.classList.contains('active')) {
                    playSound(soundName, volumeSlider.value / 100);
                } else {
                    stopSound(soundName);
                }
            }
        });
        
        // Volume change
        volumeSlider.addEventListener('input', () => {
            if (audioElements[soundName]) {
                audioElements[soundName].volume = volumeSlider.value / 100;
                console.log(`Volume for ${soundName} changed to ${volumeSlider.value}%`);
            }
        });
    });
}

/**
 * Create audio elements for all sounds
 */
function createAudioElements() {
    // Check if sounds directory exists
    fetch('src/assets/sounds/rain.mp3')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Sound file check failed: ${response.status}`);
            }
            console.log("Sound files directory verified");
        })
        .catch(error => {
            console.error("Error verifying sound files:", error);
            alert("Some sound files may be missing. Check the browser console for details.");
        });
    
    const sounds = [
        { name: 'rain', loop: true },
        { name: 'ocean', loop: true },
        { name: 'forest', loop: true }
    ];
    
    sounds.forEach(sound => {
        try {
            console.log(`Trying to load sound: ${sound.name}`);
            
            // Create a new Audio element with explicit path
            const audio = new Audio();
            audio.src = `src/assets/sounds/${sound.name}.mp3`;
            audio.preload = 'auto';
            audio.loop = sound.loop;
            
            // Force load the audio file
            audio.load();
            
            // Store the audio element
            audioElements[sound.name] = audio;
            
            // Add event listeners for debugging
            audio.addEventListener('canplaythrough', () => {
                console.log(`Sound ${sound.name} loaded successfully`);
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`Error loading sound ${sound.name}:`, e);
                console.error(`Could not load src/assets/sounds/${sound.name}.mp3`);
                
                // Try to reload with a timestamp to avoid cache issues
                const timestamp = new Date().getTime();
                audio.src = `src/assets/sounds/${sound.name}.mp3?t=${timestamp}`;
                audio.load();
            });
        } catch (e) {
            console.error(`Could not create audio element for ${sound.name}:`, e);
        }
    });
}

/**
 * Check if autoplay is supported and show button if not
 */
function checkAutoplaySupport() {
    // Create a temporary audio element to test autoplay
    const testAudio = new Audio('src/assets/sounds/ocean.mp3');
    testAudio.volume = 0.001; // Nearly silent
    
    const playPromise = testAudio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log("Autoplay is supported");
                testAudio.pause();
                window.userHasInteracted = true;
            })
            .catch(error => {
                console.log("Autoplay is not supported, will need user interaction:", error);
                // Show the play button to enable sounds
                showPlayButton();
            });
    }
}

/**
 * Play a sound with the given volume
 * @param {string} soundName - Name of the sound to play
 * @param {number} volume - Volume (0-1)
 */
function playSound(soundName, volume) {
    console.log(`Attempting to play ${soundName} at volume ${volume}`);
    
    if (!audioElements[soundName]) {
        console.error(`Sound ${soundName} not found`);
        
        // Try to recreate the audio element for rain as a fallback
        if (soundName === 'rain') {
            console.log("Attempting to recreate rain audio element");
            audioElements[soundName] = new Audio(`src/assets/sounds/${soundName}.mp3?t=${new Date().getTime()}`);
            audioElements[soundName].loop = true;
            audioElements[soundName].load();
        }
        
        if (!audioElements[soundName]) {
            return;
        }
    }
    
    try {
        // Force stop first to ensure clean playback
        try {
            audioElements[soundName].pause();
            audioElements[soundName].currentTime = 0;
        } catch (e) {
            console.warn(`Could not reset ${soundName}:`, e);
        }
        
        // Set volume
        audioElements[soundName].volume = volume;
        
        // Play the sound
        const playPromise = audioElements[soundName].play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log(`${soundName} playing successfully`);
            }).catch(error => {
                console.error(`Error playing ${soundName}:`, error);
                
                // If autoplay was prevented, show a button to enable sounds
                if (!window.userHasInteracted || error.name === 'NotAllowedError') {
                    showPlayButton();
                } else if (soundName === 'rain') {
                    // Try to reload and play rain specifically
                    reloadAndPlayRain(volume);
                }
            });
        }
    } catch (e) {
        console.error(`Error playing ${soundName}:`, e);
        if (soundName === 'rain') {
            reloadAndPlayRain(volume);
        } else {
            showPlayButton();
        }
    }
}

/**
 * Reload and play rain sound as a fallback
 * @param {number} volume - Volume level (0-1)
 */
function reloadAndPlayRain(volume) {
    console.log("Using fallback method to play rain sound");
    try {
        // Create a new audio element for rain
        const newRainAudio = new Audio(`src/assets/sounds/rain.mp3?t=${new Date().getTime()}`);
        newRainAudio.loop = true;
        newRainAudio.volume = volume;
        
        // Replace the existing audio element
        audioElements['rain'] = newRainAudio;
        
        // Play the sound
        newRainAudio.play()
            .then(() => {
                console.log("Rain sound playing successfully with fallback method");
            })
            .catch(error => {
                console.error("Fallback rain play failed:", error);
                showPlayButton();
            });
    } catch (e) {
        console.error("Fallback rain play error:", e);
    }
}

/**
 * Show a button to enable sounds (for browsers that require user interaction)
 */
function showPlayButton() {
    if (document.getElementById('enable-sound-btn')) {
        return;
    }
    
    const btn = document.createElement('button');
    btn.id = 'enable-sound-btn';
    btn.textContent = 'Enable Sounds';
    btn.className = 'btn primary-btn';
    btn.style.position = 'fixed';
    btn.style.top = '60px';
    btn.style.right = '10px';
    btn.style.zIndex = '9999';
    
    btn.addEventListener('click', () => {
        window.userHasInteracted = true;
        
        // Try to play a test sound
        const testSound = new Audio('src/assets/sounds/rain.mp3');
        testSound.volume = 0.1;
        testSound.play()
            .then(() => {
                console.log("Test sound played successfully");
                testSound.pause();
                
                // Start all currently active sounds
                startSelectedSounds();
                
                // Remove the button
                document.body.removeChild(btn);
            })
            .catch(error => {
                console.error("Error playing test sound:", error);
                alert("There was an issue enabling sounds. Please try again.");
            });
    });
    
    document.body.appendChild(btn);
    
    // Auto-remove after 10 seconds if not clicked
    setTimeout(() => {
        if (document.getElementById('enable-sound-btn')) {
            btn.style.opacity = '0.6';
            
            // Fade out after another 5 seconds
            setTimeout(() => {
                if (document.getElementById('enable-sound-btn')) {
                    document.body.removeChild(btn);
                }
            }, 5000);
        }
    }, 10000);
}

/**
 * Stop a specific sound
 * @param {string} soundName - Name of the sound to stop
 */
function stopSound(soundName) {
    if (!audioElements[soundName]) {
        return;
    }
    
    try {
        audioElements[soundName].pause();
        audioElements[soundName].currentTime = 0;
        console.log(`${soundName} stopped`);
    } catch (e) {
        console.error(`Error stopping ${soundName}:`, e);
    }
}

/**
 * Start all selected sounds
 */
function startSelectedSounds() {
    soundItems.forEach(item => {
        if (item.classList.contains('active')) {
            const soundName = item.getAttribute('data-sound');
            const volumeSlider = item.querySelector('.volume-slider');
            playSound(soundName, volumeSlider.value / 100);
        }
    });
}

/**
 * Pause all currently playing sounds
 */
function pauseAllSounds() {
    Object.keys(audioElements).forEach(soundName => {
        try {
            if (!audioElements[soundName].paused) {
                audioElements[soundName].pause();
                console.log(`${soundName} paused`);
            }
        } catch (e) {
            console.error(`Error pausing ${soundName}:`, e);
        }
    });
}

/**
 * Stop all sounds and reset
 */
function stopAllSounds() {
    Object.keys(audioElements).forEach(soundName => {
        stopSound(soundName);
    });
    
    // Reset UI
    soundItems.forEach(item => {
        item.classList.remove('active');
    });
}

/**
 * Fade out all sounds
 * @param {Function} callback - Function to call after fade out completes
 */
function fadeOutSounds(callback) {
    const activeSounds = [];
    const originalVolumes = {};
    
    // Identify which sounds are currently playing
    Object.keys(audioElements).forEach(soundName => {
        if (audioElements[soundName] && !audioElements[soundName].paused) {
            activeSounds.push(soundName);
            originalVolumes[soundName] = audioElements[soundName].volume;
        }
    });
    
    // If no sounds are playing, just call callback
    if (activeSounds.length === 0) {
        if (callback) callback();
        return;
    }
    
    // Create fade out animation
    const fadeSteps = 20;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        currentStep++;
        
        // Calculate new volume
        const fadeProgress = currentStep / fadeSteps;
        
        // Adjust volume for each sound
        activeSounds.forEach(soundName => {
            try {
                const newVolume = originalVolumes[soundName] * (1 - fadeProgress);
                audioElements[soundName].volume = Math.max(0, newVolume);
            } catch (e) {
                console.error(`Error fading ${soundName}:`, e);
            }
        });
        
        // Check if fade is complete
        if (currentStep >= fadeSteps) {
            clearInterval(fadeInterval);
            
            // Stop all sounds
            activeSounds.forEach(soundName => {
                try {
                    audioElements[soundName].pause();
                    audioElements[soundName].currentTime = 0;
                    // Restore original volume
                    audioElements[soundName].volume = originalVolumes[soundName];
                } catch (e) {
                    console.error(`Error stopping ${soundName} after fade:`, e);
                }
            });
            
            // Reset UI
            soundItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Call the callback
            if (callback) callback();
        }
    }, 50); // 50ms intervals for smooth fade
}

/**
 * Play the interval chime
 */
function playIntervalChime() {
    // Visual indicator for interval chime (since we don't have the actual sound file)
    const timerDisplay = document.querySelector('.timer-display');
    if (timerDisplay) {
        timerDisplay.classList.add('blink');
        setTimeout(() => {
            timerDisplay.classList.remove('blink');
        }, 1000);
    }
}

/**
 * Play the end chime
 */
function playEndChime() {
    // Visual indicator for end chime (since we don't have the actual sound file)
    const timerDisplay = document.querySelector('.timer-display');
    if (timerDisplay) {
        timerDisplay.classList.add('blink-end');
        setTimeout(() => {
            timerDisplay.classList.remove('blink-end');
        }, 2000);
    }
}

/**
 * Get active sound settings for storage
 * @returns {Object} Active sound settings
 */
function getActiveSoundSettings() {
    const settings = {};
    
    soundItems.forEach(item => {
        const soundName = item.getAttribute('data-sound');
        const volumeSlider = item.querySelector('.volume-slider');
        const isActive = item.classList.contains('active');
        
        settings[soundName] = {
            active: isActive,
            volume: volumeSlider ? volumeSlider.value / 100 : 0.7
        };
    });
    
    return settings;
}
