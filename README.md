# Meditime - Meditation Timer App

A clean, minimalist meditation timer application built with vanilla JavaScript.

## Features

- **Timer Customization**: Set session duration from 1-120 minutes
- **Background Sounds**: Choose from calming ambient sounds (rain, ocean, or forest)
- **Volume Control**: Adjust volume for each background sound
- **Progress Tracking**: View your meditation history with a calendar interface
- **Light/Dark Theme**: Toggle between light and dark mode
- **Local Storage**: Your meditation history and preferences are saved locally

## Structure

- `index.html` - Main interface
- `src/css/styles.css` - Styling
- `src/js/app.js` - Main app logic
- `src/js/timer.js` - Timer functionality
- `src/js/sounds.js` - Sound management
- `src/js/calendar.js` - Calendar and tracking
- `src/js/storage.js` - Local storage operations
- `src/assets/sounds/` - Sound files (MP3 format)

## Usage

1. Open `index.html` in any modern browser
2. Set your preferred timer duration
3. Select background sound(s) if desired
4. Click "Start" to begin your meditation session
5. Track your progress in the calendar view

## Implementation Notes

- Built with vanilla JavaScript (no frameworks)
- Uses the HTML5 Audio API for sound management
- Responsive design that works on desktop and mobile devices
- Data is stored in the browser's localStorage
