/**
 * Meditime - Video Background Management
 * Handles automatic background video for meditation sessions
 */

// Video elements
const backgroundVideo = document.getElementById('background-video');
const videoOverlay = document.querySelector('.video-overlay');

// Initialize video functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeBackgroundVideo();
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
