# Personal Productivity Tracker

A comprehensive single-page web application designed to help busy professionals manage their daily productivity from one unified dashboard.

## Features

### 🚀 **All-in-One Dashboard**
- Clean, modern interface with responsive design
- Professional gradient background with card-based widgets
- Hover effects and smooth transitions for enhanced user experience
- Real-time clock display with date and time
- Sound control toggle with visual feedback
- Animated particle effects and floating background elements

### 📝 **To-Do List Widget**
- Add, complete, and delete tasks
- Visual completion tracking with strikethrough text
- Persistent storage using localStorage
- Enter key support for quick task addition
- **Note-taking system for tasks** - Add comments/notes to individual tasks
- Task progress tracking with completion notifications
- Animated task completion with bounce effects

### 📋 **Rich Text Notes Widget**
- Create unlimited separate notes with custom titles
- **Rich text formatting toolbar** with bold, italic, underline, and highlight options
- **Font size selector** for customizable text appearance
- Click on any note to edit its content in a dedicated editor
- Auto-save functionality for all notes (saves as you type)
- Note preview and creation date display
- Easy delete functionality with confirmation
- Notes sorted by most recently updated
- **HTML content support** for rich formatting

### 🍅 **Pomodoro Timer Widget**
- Traditional 25-minute work sessions with 5-minute breaks
- Start, pause, and reset functionality
- Automatic mode switching between work and break
- Browser notifications when sessions complete
- Visual feedback with timer display and running animations
- **Smart button state management** (disabled states when appropriate)
- Audio alerts with customizable sound settings
- Digital clock animation effects

### 🎯 **Habit Tracker Widget**
- Add custom habits to track
- Daily check-off system with streak counting
- **Edit habit names** with inline editing functionality
- **Delete habits** with confirmation dialogs
- Streak counter to track consecutive days
- Visual feedback for completed vs pending habits
- Automatic daily reset system
- **Smart streak calculation** based on consecutive days

### ⏰ **Reminder Widget**
- Set custom reminders with specific date/time
- Browser notifications when reminders trigger
- **Input validation** - prevents setting reminders in the past
- Automatic cleanup of expired reminders
- Easy deletion of unwanted reminders
- **Automatic reminder checking** every minute

### 🔊 **Advanced Sound System**
- **Sound toggle control** with persistent settings
- **Custom audio generation** using Web Audio API
- **Multi-layered alarm sounds** with different frequencies
- Sound feedback for timer completions and reminders
- Visual sound status indicator

### 📊 **Activity Logging System**
- **Comprehensive activity tracking** for all user actions
- **Automatic log saving** every 10 minutes
- **Export functionality** to download activity logs
- **Log management** with automatic cleanup of old entries
- Detailed timestamps and categorized actions

## Technical Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: All data persists locally in your browser
- **Smart Notifications**: Get alerts for timers and reminders (works in background tabs, asks permission only once)
- **Modern UI**: Professional design with smooth animations
- **No Dependencies**: Pure HTML, CSS, and JavaScript - no external libraries needed
- **Advanced CSS**: Custom gradients, animations, and particle effects
- **Modular Architecture**: Clean, organized code with separate managers for each feature
- **Progressive Enhancement**: Graceful fallbacks for older browsers
- **Real-time Updates**: Live clock and automatic data synchronization

## Browser Compatibility

- Chrome/Edge: Full support including notifications and Web Audio API
- Firefox: Full support including notifications and Web Audio API  
- Safari: Full support including notifications and Web Audio API
- All modern browsers with localStorage and Notification API support

## Data Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Your information remains completely private
- Clear browser data to reset all information
- **Activity logs** are stored locally and can be exported or cleared manually

## Installation

No installation required! Simply:
1. Download the `productivity-tracker.html` file
2. Open it in any web browser
3. Grant notification permissions when prompted for full functionality
4. Bookmark the page for easy access
5. Optional: Save to desktop for quick launching

## Usage Guide

### **Getting Started**
- Open `productivity-tracker.html` in any modern web browser
- Grant notification permissions when prompted for full functionality
- Use the sound toggle (top-left) to enable/disable audio alerts
- The current time and date are displayed in the top-right corner

### **To-Do List**
- Type your task in the input field
- Click "Add Task" or press Enter to add the task
- Check the checkbox to mark tasks as complete
- Click "Add Note" to add comments or stage information to tasks
- Click "Delete" to remove tasks

### **Rich Text Notes**
- Type a note title and click "New Note" or press Enter
- Click on any existing note to edit it in the rich text editor
- Use the formatting toolbar for bold, italic, underline, and highlighting
- Select different font sizes from the dropdown
- Your notes are automatically saved as you type
- Use Save/Close buttons or just close to finish editing
- Click Delete in the editor to remove unwanted notes

### **Pomodoro Timer**
- Click "Start" to begin a 25-minute work session
- Click "Pause" to temporarily stop the timer
- Click "Reset" to restart the current session
- Timer automatically switches between work and break modes
- Receive audio and visual notifications when sessions complete

### **Habit Tracker**
- Type a habit name and click "Add Habit"
- Click "Mark Done" to complete the habit for today
- Use the edit button (✏️) to modify habit names
- Use the delete button (🗑️) to remove habits
- Track your streak count for motivation
- Habits reset daily for continuous tracking

### **Reminders**
- Enter reminder text in the first field
- Select date and time using the datetime picker
- Click "Set Reminder" to save
- The system prevents setting reminders in the past
- Receive notifications when reminders trigger
- Delete reminders you no longer need

### **Sound Control**
- Click the sound toggle in the top-left to enable/disable audio
- When enabled, you'll hear custom-generated sounds for alerts
- Sound preference is saved and persists between sessions
- Test sound is played when enabling audio

## Tips for Maximum Productivity

1. **Start your day** by writing tasks in the to-do list with notes for context
2. **Use rich text notes** for meeting notes, brainstorming, and important information
3. **Set reminders** for important deadlines and meetings throughout the day
4. **Track daily habits** like exercise, reading, or meditation with streak goals
5. **Use Pomodoro sessions** for focused work on important tasks
6. **Review activity logs** to analyze your productivity patterns
7. **Enable sound notifications** for better attention to timer and reminder alerts

## File Structure

- `productivity-tracker.html` - Main application file
- `styles.css` - Complete styling and animations
- `app.js` - Full application logic and feature implementation
- `README.md` - This documentation file

Enjoy your enhanced productivity journey! 🚀 