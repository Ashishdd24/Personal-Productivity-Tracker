// Productivity Tracker - Main Application Logic
class ProductivityTracker {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.currentEditingNote = null;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        
        // Pomodoro timer variables
        this.timerMinutes = 25;
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.isWorkSession = true;
        this.isRunning = false;
        
        // Logging system
        this.logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadAllModules();
                this.setupEventListeners();
                this.initializeNotifications();
                this.initializeAnimations();
                this.initializeClock();
            });
        } else {
            // DOM is already loaded
            this.loadAllModules();
            this.setupEventListeners();
            this.initializeNotifications();
            this.initializeAnimations();
            this.initializeClock();
            this.log('App initialized', 'SYSTEM', 'Productivity tracker started successfully');
            
            // Set up automatic log saving every 10 minutes
            setInterval(() => this.autoSaveLogs(), 600000); // 10 minutes
            
            // Auto-save on page unload
            window.addEventListener('beforeunload', () => this.autoSaveLogs());
        }
    }

    loadAllModules() {
        this.todoManager.load();
        this.habitManager.load();
        this.reminderManager.load();
        this.noteManager.load();
        this.timerManager.updateDisplay();
        this.timerManager.initializeButtons();
        this.soundManager.updateToggle();
        this.reminderManager.checkReminders();
        setInterval(() => this.reminderManager.checkReminders(), 60000);
    }

    setupEventListeners() {
        // Todo input
        const todoInput = document.getElementById('todoInput');
        const todoAddBtn = todoInput.nextElementSibling;
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.todoManager.add();
        });
        todoAddBtn.addEventListener('click', () => this.todoManager.add());

        // Habit input
        const habitInput = document.getElementById('habitInput');
        const habitAddBtn = habitInput.nextElementSibling;
        habitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.habitManager.add();
        });
        habitAddBtn.addEventListener('click', () => this.habitManager.add());

        // Note input
        const noteInput = document.getElementById('noteTitle');
        const noteAddBtn = noteInput.nextElementSibling;
        noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.noteManager.add();
        });
        noteAddBtn.addEventListener('click', () => this.noteManager.add());

        // Timer controls
        document.getElementById('startBtn').addEventListener('click', () => this.timerManager.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.timerManager.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.timerManager.reset());

        // Sound toggle - fix the binding issue
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.soundManager.toggle();
            });
        }
    }

    // Todo Management Module
    get todoManager() {
        return {
            add: () => {
                const input = document.getElementById('todoInput');
                const text = input.value.trim();
                
                if (text) {
                    const todo = {
                        id: Date.now(),
                        text: text,
                        completed: false,
                        comment: '',
                        createdAt: new Date().toISOString()
                    };
                    
                    this.todos.push(todo);
                    this.saveData('todos', this.todos);
                    this.todoManager.load();
                    input.value = '';
                    
                    this.log('Task added', 'TODO', `"${text}"`);
                    this.animationManager.showNotification('Task Added!', `"${text}" has been added to your todo list.`);
                }
            },

            toggle: (id) => {
                const todo = this.todos.find(t => t.id === id);
                const newState = !todo.completed;
                
                this.todos = this.todos.map(todo => 
                    todo.id === id ? { ...todo, completed: newState } : todo
                );
                
                this.log(newState ? 'Task completed' : 'Task reopened', 'TODO', `"${todo.text}"`);
                this.saveData('todos', this.todos);
                this.todoManager.load();
                this.todoManager.showSummary();
            },

            delete: (id) => {
                const todo = this.todos.find(t => t.id === id);
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.log('Task deleted', 'TODO', `"${todo.text}"`);
                this.saveData('todos', this.todos);
                this.todoManager.load();
                this.animationManager.showNotification('Task Deleted', 'Task has been removed from your list.');
            },

            addComment: (id, comment) => {
                this.todos = this.todos.map(todo => 
                    todo.id === id ? { ...todo, comment: comment.trim() } : todo
                );
                this.saveData('todos', this.todos);
                this.todoManager.load();
            },

            load: () => {
                const todoList = document.getElementById('todoList');
                todoList.innerHTML = '';
                
                this.todos.forEach(todo => {
                    const todoElement = document.createElement('div');
                    todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                    todoElement.innerHTML = `
                        <div class="todo-item-header">
                            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                                   onchange="app.todoManager.toggle(${todo.id})">
                            <span class="todo-text">${todo.text}</span>
                            <div class="todo-actions">
                                <button class="todo-comment-btn" onclick="app.todoManager.toggleComment(${todo.id})">
                                    ${todo.comment ? 'Edit Note' : 'Add Note'}
                                </button>
                                <button class="todo-delete" onclick="app.todoManager.delete(${todo.id})">Delete</button>
                            </div>
                        </div>
                        ${todo.comment ? `<div class="todo-comment">${todo.comment}</div>` : ''}
                        <div class="todo-comment-input" id="comment-input-${todo.id}" style="display: none;">
                            <input type="text" placeholder="Add a reason or stage note..." value="${todo.comment || ''}" id="comment-text-${todo.id}">
                            <button onclick="app.todoManager.saveComment(${todo.id})">Save</button>
                        </div>
                    `;
                    todoList.appendChild(todoElement);
                });
            },

            toggleComment: (id) => {
                const commentInput = document.getElementById(`comment-input-${id}`);
                const isVisible = commentInput.style.display !== 'none';
                commentInput.style.display = isVisible ? 'none' : 'block';
                
                if (!isVisible) {
                    const textInput = document.getElementById(`comment-text-${id}`);
                    textInput.focus();
                }
            },

            saveComment: (id) => {
                const textInput = document.getElementById(`comment-text-${id}`);
                const comment = textInput.value.trim();
                this.todoManager.addComment(id, comment);
            },

            showSummary: () => {
                const completed = this.todos.filter(todo => todo.completed).length;
                const total = this.todos.length;
                
                if (completed > 0) {
                    this.animationManager.showNotification(
                        'Progress Update', 
                        `${completed} of ${total} tasks completed! Keep going! 🎉`
                    );
                }
            }
        };
    }

    // Habit Management Module
    get habitManager() {
        return {
            add: () => {
                const input = document.getElementById('habitInput');
                const text = input.value.trim();
                
                if (text) {
                    const habit = {
                        id: Date.now(),
                        name: text,
                        streak: 0,
                        lastCompleted: null,
                        completedToday: false
                    };
                    
                    this.habits.push(habit);
                    this.log('Habit added', 'HABIT', `"${text}"`);
                    this.saveData('habits', this.habits);
                    this.habitManager.load();
                    input.value = '';
                    
                    this.animationManager.showNotification('Habit Added!', `"${text}" is now being tracked.`);
                }
            },

            toggle: (id) => {
                const today = new Date().toDateString();
                
                this.habits = this.habits.map(habit => {
                    if (habit.id === id) {
                        if (!habit.completedToday) {
                            // Complete habit
                            const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            
                            if (!lastCompleted || lastCompleted.toDateString() === yesterday.toDateString()) {
                                habit.streak++;
                            } else if (lastCompleted.toDateString() !== today) {
                                habit.streak = 1;
                            }
                            
                            habit.lastCompleted = today;
                            habit.completedToday = true;
                            
                            this.animationManager.showNotification('Habit Completed!', `Great job! Your streak is now ${habit.streak} days! 🔥`);
                        } else {
                            // Uncomplete habit
                            habit.completedToday = false;
                            if (habit.lastCompleted === today) {
                                habit.streak = Math.max(0, habit.streak - 1);
                                habit.lastCompleted = null;
                            }
                        }
                    }
                    return habit;
                });
                
                this.saveData('habits', this.habits);
                this.habitManager.load();
            },

            edit: (id) => {
                const habit = this.habits.find(h => h.id === id);
                if (habit) {
                    const newName = prompt('Edit habit name:', habit.name);
                    if (newName && newName.trim()) {
                        habit.name = newName.trim();
                        this.saveData('habits', this.habits);
                        this.habitManager.load();
                        this.animationManager.showNotification('Habit Updated', 'Habit name has been updated.');
                    }
                }
            },

            delete: (id) => {
                if (confirm('Are you sure you want to delete this habit?')) {
                    this.habits = this.habits.filter(habit => habit.id !== id);
                    this.saveData('habits', this.habits);
                    this.habitManager.load();
                    this.animationManager.showNotification('Habit Deleted', 'Habit has been removed.');
                }
            },

            load: () => {
                const habitList = document.getElementById('habitList');
                habitList.innerHTML = '';
                
                // Reset daily status
                const today = new Date().toDateString();
                this.habits.forEach(habit => {
                    if (habit.lastCompleted !== today) {
                        habit.completedToday = false;
                    }
                });
                
                this.habits.forEach(habit => {
                    const habitElement = document.createElement('div');
                    habitElement.className = 'habit-item';
                    habitElement.innerHTML = `
                        <div>
                            <div class="habit-name">${habit.name}</div>
                            <div class="habit-streak">Streak: ${habit.streak} days</div>
                        </div>
                        <div class="habit-actions">
                            <button class="habit-edit" onclick="app.habitManager.edit(${habit.id})" title="Edit">✏️</button>
                            <button class="habit-delete" onclick="app.habitManager.delete(${habit.id})" title="Delete">🗑️</button>
                            <button class="habit-check ${habit.completedToday ? 'completed' : ''}" 
                                    onclick="app.habitManager.toggle(${habit.id})">
                                ${habit.completedToday ? 'Completed' : 'Mark Done'}
                            </button>
                        </div>
                    `;
                    habitList.appendChild(habitElement);
                });
            }
        };
    }

    // Note Management Module
    get noteManager() {
        return {
            add: () => {
                const titleInput = document.getElementById('noteTitle');
                const title = titleInput.value.trim();
                
                if (title) {
                    const note = {
                        id: Date.now(),
                        title: title,
                        content: '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    this.notes.push(note);
                    this.saveData('notes', this.notes);
                    this.noteManager.load();
                    titleInput.value = '';
                    
                    // Automatically open the new note for editing
                    this.noteManager.edit(note.id);
                }
            },

            edit: (id) => {
                const note = this.notes.find(n => n.id === id);
                if (note) {
                    this.currentEditingNote = note;
                    
                    document.getElementById('currentNoteTitle').value = note.title;
                    document.getElementById('currentNoteContent').innerHTML = note.content;
                    document.getElementById('noteEditor').style.display = 'block';
                    
                    // Setup auto-save for content
                    this.noteManager.setupAutoSave();
                    
                    // Scroll the notes widget to make editor visible
                    const widget = document.getElementById('noteEditor').closest('.widget');
                    widget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            },

            save: () => {
                if (this.currentEditingNote) {
                    const title = document.getElementById('currentNoteTitle').value.trim();
                    const content = document.getElementById('currentNoteContent').innerHTML;
                    
                    if (title) {
                        this.currentEditingNote.title = title;
                        this.currentEditingNote.content = content;
                        this.currentEditingNote.updatedAt = new Date().toISOString();
                        
                        this.saveData('notes', this.notes);
                        this.noteManager.load();
                    }
                }
            },

            close: () => {
                if (this.currentEditingNote) {
                    this.noteManager.save(); // Save before closing
                }
                document.getElementById('noteEditor').style.display = 'none';
                this.currentEditingNote = null;
            },

            delete: () => {
                if (this.currentEditingNote && confirm('Are you sure you want to delete this note?')) {
                    this.notes = this.notes.filter(note => note.id !== this.currentEditingNote.id);
                    this.saveData('notes', this.notes);
                    this.noteManager.load();
                    this.noteManager.close();
                    this.animationManager.showNotification('Note Deleted', 'Note has been removed.');
                }
            },

            load: () => {
                const notesList = document.getElementById('notesList');
                notesList.innerHTML = '';
                
                // Sort notes by updated date (most recent first)
                const sortedNotes = this.notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                
                sortedNotes.forEach(note => {
                    const noteElement = document.createElement('div');
                    noteElement.className = 'note-item';
                    noteElement.onclick = () => this.noteManager.edit(note.id);
                    
                    const textContent = note.content.replace(/<[^>]*>/g, ''); // Strip HTML tags for preview
                    const preview = textContent.substring(0, 50) + (textContent.length > 50 ? '...' : '');
                    const date = new Date(note.updatedAt).toLocaleDateString();
                    
                    noteElement.innerHTML = `
                        <div class="note-item-content">
                            <div class="note-item-title">${note.title}</div>
                            <div class="note-item-preview">${preview || 'No content yet...'}</div>
                        </div>
                        <div class="note-item-date">${date}</div>
                    `;
                    notesList.appendChild(noteElement);
                });
            },

            setupAutoSave: () => {
                const contentDiv = document.getElementById('currentNoteContent');
                const titleInput = document.getElementById('currentNoteTitle');
                
                // Remove existing listeners to avoid duplicates
                contentDiv.removeEventListener('input', this.noteManager.autoSave);
                titleInput.removeEventListener('input', this.noteManager.autoSave);
                
                // Add new listeners
                contentDiv.addEventListener('input', this.noteManager.autoSave);
                titleInput.addEventListener('input', this.noteManager.autoSave);
            },

            autoSave: () => {
                if (this.currentEditingNote) {
                    const title = document.getElementById('currentNoteTitle').value.trim();
                    const content = document.getElementById('currentNoteContent').innerHTML;
                    
                    if (title) {
                        this.currentEditingNote.title = title;
                        this.currentEditingNote.content = content;
                        this.currentEditingNote.updatedAt = new Date().toISOString();
                        
                        this.saveData('notes', this.notes);
                        this.noteManager.load();
                    }
                }
            }
        };
    }

    // Timer Management Module
    get timerManager() {
        return {
            start: () => {
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.timerInterval = setInterval(() => this.timerManager.update(), 1000);
                    
                    const sessionType = this.isWorkSession ? 'work' : 'break';
                    this.log('Timer started', 'TIMER', `${sessionType} session started - ${this.timerMinutes}:${this.timerSeconds.toString().padStart(2, '0')}`);
                    
                    // Update button states
                    document.getElementById('startBtn').textContent = 'Running...';
                    document.getElementById('startBtn').disabled = true;
                    document.getElementById('pauseBtn').disabled = false;
                    document.getElementById('resetBtn').disabled = false;
                    
                    // Add running animation to timer
                    document.getElementById('timerTime').classList.add('running');
                }
            },

            pause: () => {
                if (this.isRunning) {
                    this.isRunning = false;
                    clearInterval(this.timerInterval);
                    
                    const sessionType = this.isWorkSession ? 'work' : 'break';
                    this.log('Timer paused', 'TIMER', `${sessionType} session paused - ${this.timerMinutes}:${this.timerSeconds.toString().padStart(2, '0')} remaining`);
                    
                    // Update button states
                    document.getElementById('startBtn').textContent = 'Start';
                    document.getElementById('startBtn').disabled = false;
                    document.getElementById('pauseBtn').disabled = true;
                    // Keep reset enabled when paused
                    
                    // Remove running animation from timer
                    document.getElementById('timerTime').classList.remove('running');
                }
            },

            reset: () => {
                this.timerManager.pause();
                this.timerMinutes = this.isWorkSession ? 25 : 5;
                this.timerSeconds = 0;
                this.timerManager.updateDisplay();
                
                const sessionType = this.isWorkSession ? 'work' : 'break';
                this.log('Timer reset', 'TIMER', `${sessionType} session reset to ${this.timerMinutes}:00`);
                
                // Reset button states to initial
                document.getElementById('pauseBtn').disabled = true;
                document.getElementById('resetBtn').disabled = true;
                
                // Remove running animation from timer
                document.getElementById('timerTime').classList.remove('running');
            },

            update: () => {
                if (this.timerSeconds === 0) {
                    if (this.timerMinutes === 0) {
                        // Timer finished
                        this.timerManager.pause();
                        this.isWorkSession = !this.isWorkSession;
                        this.timerMinutes = this.isWorkSession ? 25 : 5;
                        this.timerSeconds = 0;
                        this.timerManager.updateDisplay();
                        
                        // Show notification
                        const message = this.isWorkSession ? 'Break time is over! Ready for work?' : 'Work session complete! Take a break.';
                        this.soundManager.showNotification('Pomodoro Timer', message, '🍅');
                        return;
                    }
                    this.timerMinutes--;
                    this.timerSeconds = 59;
                } else {
                    this.timerSeconds--;
                }
                this.timerManager.updateDisplay();
            },

            updateDisplay: () => {
                const timeDisplay = document.getElementById('timerTime');
                const modeDisplay = document.getElementById('timerMode');
                
                const minutes = String(this.timerMinutes).padStart(2, '0');
                const seconds = String(this.timerSeconds).padStart(2, '0');
                
                timeDisplay.textContent = `${minutes}:${seconds}`;
                modeDisplay.textContent = this.isWorkSession ? 'Work Session' : 'Break Time';
            },

            initializeButtons: () => {
                // Set initial button states
                document.getElementById('startBtn').disabled = false;
                document.getElementById('pauseBtn').disabled = true;
                document.getElementById('resetBtn').disabled = true;
            }
        };
    }

    // Sound Management Module
    get soundManager() {
        const self = this;
        return {
            toggle: () => {
                self.soundEnabled = !self.soundEnabled;
                localStorage.setItem('soundEnabled', self.soundEnabled);
                self.log('Sound toggled', 'SYSTEM', self.soundEnabled ? 'Sound enabled' : 'Sound disabled');
                
                // Update the toggle display directly
                const toggle = document.getElementById('soundToggle');
                if (toggle) {
                    if (self.soundEnabled) {
                        toggle.textContent = '🔊 Sound ON';
                        toggle.classList.remove('muted');
                    } else {
                        toggle.textContent = '🔇 Sound OFF';
                        toggle.classList.add('muted');
                    }
                }
                
                // Test sound when enabling
                if (self.soundEnabled) {
                    self.soundManager.playAlarm();
                    self.animationManager.showNotification('Sound Enabled', 'Notifications will now play sounds.');
                } else {
                    self.animationManager.showNotification('Sound Disabled', 'Notifications will be silent.');
                }
            },

            updateToggle: () => {
                const toggle = document.getElementById('soundToggle');
                if (toggle) {
                    if (self.soundEnabled) {
                        toggle.textContent = '🔊 Sound ON';
                        toggle.classList.remove('muted');
                    } else {
                        toggle.textContent = '🔇 Sound OFF';
                        toggle.classList.add('muted');
                    }
                }
            },

            playAlarm: () => {
                if (!self.soundEnabled) return;
                
                try {
                    // Create audio context for alarm sound
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    // Create oscillator for alarm sound
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Alarm sound parameters
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);
                    
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                    
                    oscillator.type = 'square';
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 1);
                    
                    // Repeat the alarm 3 times
                    setTimeout(() => {
                        if (self.soundEnabled) {
                            const osc2 = audioContext.createOscillator();
                            const gain2 = audioContext.createGain();
                            osc2.connect(gain2);
                            gain2.connect(audioContext.destination);
                            osc2.frequency.setValueAtTime(1200, audioContext.currentTime);
                            gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
                            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                            osc2.type = 'sawtooth';
                            osc2.start();
                            osc2.stop(audioContext.currentTime + 0.5);
                        }
                    }, 200);
                } catch (error) {
                    console.log('Audio context not available');
                }
            },

            showNotification: (title, body, icon = '🔔') => {
                // Play alarm sound first
                self.soundManager.playAlarm();
                
                if ('Notification' in window && Notification.permission === 'granted') {
                    // Use the Notification API for background notifications
                    const notification = new Notification(title, {
                        body: body,
                        icon: icon,
                        badge: icon,
                        tag: 'productivity-tracker-' + Date.now(),
                        requireInteraction: true,
                        silent: false,
                        vibrate: [200, 100, 200]
                    });

                    // Auto-close notification after 10 seconds
                    setTimeout(() => {
                        notification.close();
                    }, 10000);

                    return notification;
                } else {
                    // Fallback to alert if notifications are denied
                    alert(`${title}: ${body}`);
                }
                return null;
            }
        };
    }

    // Reminder Management Module
    get reminderManager() {
        return {
            add: () => {
                const textInput = document.getElementById('reminderText');
                const timeInput = document.getElementById('reminderTime');
                
                const text = textInput.value.trim();
                const time = timeInput.value;
                
                if (text && time) {
                    const reminderTime = new Date(time);
                    const now = new Date();
                    
                    // Check if the selected time is in the past
                    if (reminderTime <= now) {
                        this.animationManager.showNotification('Invalid Time', 'Please select a future time for your reminder.', 'error');
                        return;
                    }
                    
                    const reminder = {
                        id: Date.now(),
                        text: text,
                        time: reminderTime,
                        triggered: false
                    };
                    
                    this.reminders.push(reminder);
                    this.saveData('reminders', this.reminders);
                    this.reminderManager.load();
                    
                    textInput.value = '';
                    timeInput.value = '';
                    
                    this.animationManager.showNotification('Reminder Set!', `You'll be reminded about "${text}" at ${reminderTime.toLocaleString()}.`);
                }
            },

            delete: (id) => {
                this.reminders = this.reminders.filter(reminder => reminder.id !== id);
                this.saveData('reminders', this.reminders);
                this.reminderManager.load();
            },

            load: () => {
                const reminderList = document.getElementById('reminderList');
                reminderList.innerHTML = '';
                
                // Filter out past reminders
                const now = new Date();
                this.reminders = this.reminders.filter(reminder => new Date(reminder.time) > now || !reminder.triggered);
                
                this.reminders.sort((a, b) => new Date(a.time) - new Date(b.time));
                
                this.reminders.forEach(reminder => {
                    const reminderElement = document.createElement('div');
                    reminderElement.className = 'reminder-item';
                    reminderElement.innerHTML = `
                        <div class="reminder-text">${reminder.text}</div>
                        <div class="reminder-time">${new Date(reminder.time).toLocaleString()}</div>
                        <button onclick="app.reminderManager.delete(${reminder.id})" 
                                style="margin-top: 8px; padding: 4px 8px; background: #ff4757; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                    `;
                    reminderList.appendChild(reminderElement);
                });
            },

            checkReminders: () => {
                const now = new Date();
                
                this.reminders.forEach(reminder => {
                    if (!reminder.triggered && new Date(reminder.time) <= now) {
                        reminder.triggered = true;
                        
                        // Show browser notification
                        this.soundManager.showNotification('Reminder', reminder.text, '⏰');
                    }
                });
                
                this.saveData('reminders', this.reminders);
                this.reminderManager.load();
            }
        };
    }

    // Animation Management Module
    get animationManager() {
        return {
            showNotification: (title, message, type = 'success') => {
                const popup = document.createElement('div');
                popup.className = `notification-popup ${type}`;
                
                const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
                const titleColor = type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#27ae60';
                const messageColor = type === 'error' ? '#c0392b' : '#666';
                
                popup.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 5px; color: ${titleColor};">
                        ${icon} ${title}
                    </div>
                    <div style="font-size: 0.9em; color: ${messageColor};">${message}</div>
                `;
                
                document.body.appendChild(popup);
                
                setTimeout(() => popup.classList.add('show'), 100);
                
                const displayTime = type === 'error' ? 4000 : 3000;
                setTimeout(() => {
                    popup.classList.remove('show');
                    setTimeout(() => {
                        if (popup.parentNode) {
                            popup.parentNode.removeChild(popup);
                        }
                    }, 400);
                }, displayTime);
            }
        };
    }

    // Notification Management
    initializeNotifications() {
        if ('Notification' in window) {
            // Check if permission was already stored
            const storedPermission = localStorage.getItem('notificationPermission');
            
            if (storedPermission === 'granted') {
                // Permission already granted, no need to ask again
                return;
            } else if (storedPermission === 'denied') {
                // Permission denied, don't ask again
                return;
            } else if (Notification.permission === 'default') {
                // Only ask once and store the result
                Notification.requestPermission().then((permission) => {
                    localStorage.setItem('notificationPermission', permission);
                    if (permission === 'granted') {
                        setTimeout(() => {
                            this.soundManager.showNotification('Productivity Tracker Ready!', 'Your workspace is set up and ready to boost your productivity! 🚀', '✅');
                        }, 1000);
                    }
                });
            } else {
                // Store current permission state
                localStorage.setItem('notificationPermission', Notification.permission);
            }
        }
    }

    // Animation Initialization
    initializeAnimations() {
        this.createParticles();
        this.addRippleEffects();
        this.animateWidgetsOnLoad();
    }

    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.body.appendChild(particlesContainer);

        for (let i = 0; i < 50; i++) {
            this.createParticle(particlesContainer);
        }

        // Create new particles periodically
        setInterval(() => {
            if (particlesContainer.children.length < 50) {
                this.createParticle(particlesContainer);
            }
        }, 300);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
        
        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 35000);
    }

    addRippleEffects() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.add('ripple');
        });
    }

    animateWidgetsOnLoad() {
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach((widget, index) => {
            widget.style.opacity = '0';
            widget.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                widget.style.transition = 'all 0.6s ease-out';
                widget.style.opacity = '1';
                widget.style.transform = 'translateY(0)';
            }, 200 * index);
        });
    }

    // Clock functionality
    initializeClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        const clockElement = document.getElementById('currentTime');
        if (clockElement) {
            clockElement.innerHTML = `<div>${dateString}</div><div>${timeString}</div>`;
        }
    }

    // Logging System
    log(action, category, details = '') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            action,
            category,
            details,
            id: Date.now()
        };
        
        this.logs.unshift(logEntry); // Add to beginning for newest first
        
        // Keep only last 1000 logs to prevent storage overflow
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(0, 1000);
        }
        
        localStorage.setItem('activityLogs', JSON.stringify(this.logs));
        console.log(`[${timestamp}] ${category.toUpperCase()}: ${action} - ${details}`);
    }

    autoSaveLogs() {
        // Auto-save logs every 10 minutes silently
        if (this.logs.length > 0) {
            const logContent = this.logs.map(log => {
                const date = new Date(log.timestamp).toLocaleString();
                return `[${date}] ${log.category.toUpperCase()}: ${log.action}${log.details ? ' - ' + log.details : ''}`;
            }).join('\n');
            
            // Save to localStorage with timestamp
            const autoSaveKey = `logs_backup_${new Date().toISOString().split('T')[0]}`;
            localStorage.setItem(autoSaveKey, logContent);
            
            // Keep only last 7 days of backups
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];
            
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('logs_backup_') && key < `logs_backup_${cutoffDate}`) {
                    localStorage.removeItem(key);
                }
            });
        }
    }

    exportLogs() {
        const logContent = this.logs.map(log => {
            const date = new Date(log.timestamp).toLocaleString();
            return `[${date}] ${log.category.toUpperCase()}: ${log.action}${log.details ? ' - ' + log.details : ''}`;
        }).join('\n');
        
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productivity-tracker-logs-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.log('Logs exported', 'SYSTEM', `${this.logs.length} entries exported`);
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('activityLogs');
        this.log('Logs cleared', 'SYSTEM', 'All activity logs removed');
    }

    // Data persistence
    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

// Rich text formatting functions for notes
function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('currentNoteContent').focus();
}

function highlightText() {
    document.execCommand('backColor', false, '#ffff00');
    document.getElementById('currentNoteContent').focus();
}

function changeFontSize(size) {
    document.execCommand('fontSize', false, '1');
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        try {
            range.surroundContents(span);
        } catch (e) {
            span.appendChild(range.extractContents());
            range.insertNode(span);
        }
    }
    document.getElementById('currentNoteContent').focus();
}

// Global app instance
const app = new ProductivityTracker(); 