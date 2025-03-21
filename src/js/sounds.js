/**
 * Meditime - Sound Management
 * Handles background sounds and chimes
 */

// Sound objects storage
const audioElements = {};

// DOM Elements
let soundItems;

// Flag to track if user has interacted
let userHasInteracted = false;

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
        userHasInteracted = true;
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
            const audio = new Audio(`src/assets/sounds/${sound.name}.mp3`);
            audio.preload = 'auto';
            audio.loop = sound.loop;
            
            // Store the audio element
            audioElements[sound.name] = audio;
            
            // Add event listeners for debugging
            audio.addEventListener('canplaythrough', () => {
                console.log(`Sound ${sound.name} loaded successfully`);
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`Error loading sound ${sound.name}:`, e);
                console.error(`Could not load src/assets/sounds/${sound.name}.mp3`);
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
    const testAudio = new Audio('src/assets/sounds/rain.mp3');
    testAudio.volume = 0.001; // Nearly silent
    
    const playPromise = testAudio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log("Autoplay is supported");
                testAudio.pause();
                userHasInteracted = true;
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
        return;
    }
    
    try {
        // Set volume
        audioElements[soundName].volume = volume;
        
        // Reset time if it was played before
        if (audioElements[soundName].currentTime > 0) {
            audioElements[soundName].currentTime = 0;
        }
        
        // Play the sound
        const playPromise = audioElements[soundName].play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log(`${soundName} playing successfully`);
            }).catch(error => {
                console.error(`Error playing ${soundName}:`, error);
                
                // If autoplay was prevented, show a button to enable sounds
                if (!userHasInteracted || error.name === 'NotAllowedError') {
                    showPlayButton();
                }
            });
        }
    } catch (e) {
        console.error(`Error playing ${soundName}:`, e);
        showPlayButton();
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
        userHasInteracted = true;
        
        // Try to play all active sounds
        soundItems.forEach(item => {
            if (item.classList.contains('active')) {
                const soundName = item.getAttribute('data-sound');
                const volume = item.querySelector('.volume-slider').value / 100;
                playSound(soundName, volume);
            }
        });
        
        // Remove button
        document.body.removeChild(btn);
    });
    
    document.body.appendChild(btn);
}

/**
 * Stop a specific sound
 */
function stopSound(soundName) {
    if (audioElements[soundName]) {
        try {
            audioElements[soundName].pause();
            audioElements[soundName].currentTime = 0;
        } catch (e) {
            console.error(`Error stopping ${soundName}:`, e);
        }
    }
}

/**
 * Start all selected sounds
 */
function startSelectedSounds() {
    soundItems.forEach(item => {
        if (item.classList.contains('active')) {
            const soundName = item.getAttribute('data-sound');
            const volume = item.querySelector('.volume-slider').value / 100;
            playSound(soundName, volume);
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
}

/**
 * Fade out all sounds
 * @param {Function} callback - Function to call after fade out completes
 */
function fadeOutSounds(callback) {
    const activeSounds = Object.keys(audioElements).filter(soundName => 
        !audioElements[soundName].paused
    );
    
    if (activeSounds.length === 0) {
        if (callback) callback();
        return;
    }
    
    let fadeSteps = 20;
    const fadeInterval = 50; // ms
    const originalVolumes = {};
    
    // Store original volumes
    activeSounds.forEach(soundName => {
        originalVolumes[soundName] = audioElements[soundName].volume;
    });
    
    const fadeIntervalId = setInterval(() => {
        fadeSteps--;
        
        if (fadeSteps <= 0) {
            clearInterval(fadeIntervalId);
            
            // Stop all sounds
            activeSounds.forEach(soundName => {
                audioElements[soundName].pause();
                audioElements[soundName].currentTime = 0;
                
                // Restore original volume for next time
                audioElements[soundName].volume = originalVolumes[soundName];
            });
            
            if (callback) callback();
            return;
        }
        
        // Reduce volume gradually
        activeSounds.forEach(soundName => {
            const newVolume = originalVolumes[soundName] * (fadeSteps / 20);
            audioElements[soundName].volume = newVolume;
        });
    }, fadeInterval);
}

/**
 * Play the interval chime
 */
function playIntervalChime() {
    console.log("Interval chime triggered");
    // Visual feedback for interval chime (since sound files aren't present)
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
    console.log("End chime triggered");
    // Visual feedback for end chime (since sound files aren't present)
    const timerDisplay = document.querySelector('.timer-display');
    
    if (timerDisplay) {
        timerDisplay.classList.add('blink');
        setTimeout(() => {
            timerDisplay.classList.remove('blink');
        }, 1000);
    }
}

/**
 * Get active sound settings for storage
 */
function getActiveSoundSettings() {
    const settings = {};
    
    soundItems.forEach(item => {
        const soundName = item.getAttribute('data-sound');
        const isActive = item.classList.contains('active');
        const volume = parseInt(item.querySelector('.volume-slider').value);
        
        settings[soundName] = {
            active: isActive,
            volume: volume
        };
    });
    
    return settings;
}
