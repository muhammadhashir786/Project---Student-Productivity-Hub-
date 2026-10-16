// --- 1. DOM Elements Selection ---

const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskDateInput = document.getElementById('task-date');
const taskPrioritySelect = document.getElementById('task-priority');
const taskListContainer = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');

const totalCountSpan = document.getElementById('total-count');
const completedCountSpan = document.getElementById('completed-count');
const pendingCountSpan = document.getElementById('pending-count');

const filterButtons = document.querySelectorAll('.filter-btn');
let currentFilter = 'default'; // Current active filter state

let editingIndex = null; // Track karega ke kaun sa task edit ho raha hai

// --- 2. State Management ---

// LocalStorage se pehle ke tasks load karenge, agar nahi hain toh empty array rakhenge
let tasks = JSON.parse(localStorage.getItem('productivity_tasks')) || [];

// --- 3. Save Tasks to LocalStorage ---
function saveTasksToStorage() {
    localStorage.setItem('productivity_tasks', JSON.stringify(tasks));
}

// --- 4. Render Tasks on Screen ---
function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase();

    // Step A: Pehle search term par filter karna
    let filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm)
    );

    // Step B: Phir status filter (All, Pending, Completed) par filter karna
    if (currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = `<p class="empty-message">No matching tasks found.</p>`;
        updateCounters();
        return;
    }

    taskListContainer.innerHTML = '';

    filteredTasks.forEach((task) => {
        const originalIndex = tasks.indexOf(task);

        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;

        let priorityClass = `priority-${task.priority.toLowerCase()}`;

        taskCard.innerHTML = `
            <div class="task-info">
                <div class="task-header-row">
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <span class="badge ${priorityClass}">${task.priority}</span>
                </div>
                ${task.desc ? `<p class="task-desc">${escapeHtml(task.desc)}</p>` : ''}
                <small class="task-date">Due: ${task.date}</small>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask(${originalIndex})">Edit</button>
                <button class="btn-toggle" onclick="toggleTaskStatus(${originalIndex})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn-delete" onclick="deleteTask(${originalIndex})">Delete</button>
            </div>
        `;

        taskListContainer.appendChild(taskCard);
    });

    updateCounters();
}

// --- 5. Update Dashboard Counters ---
function updateCounters() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalCountSpan.textContent = total;
    completedCountSpan.textContent = completed;
    pendingCountSpan.textContent = pending;
}


// --- 6. Add New Task Event Listener ---
// --- Add or Update Task Event Listener ---
taskForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (editingIndex !== null) {
        // Agar hum edit mode mein hain, toh existing task ko update karenge
        tasks[editingIndex].title = taskTitleInput.value.trim();
        tasks[editingIndex].desc = taskDescInput.value.trim();
        tasks[editingIndex].date = taskDateInput.value;
        tasks[editingIndex].priority = taskPrioritySelect.value;

        // Reset editing state
        editingIndex = null;
        taskForm.querySelector('button[type="submit"]').textContent = 'Add Task';
    } else {
        // Normal New Task addition
        const newTask = {
            title: taskTitleInput.value.trim(),
            desc: taskDescInput.value.trim(),
            date: taskDateInput.value,
            priority: taskPrioritySelect.value,
            completed: false
        };
        tasks.push(newTask);
    }

    saveTasksToStorage();
    renderTasks();
    taskForm.reset();
});

// --- Edit Task Function ---
window.editTask = function (index) {
    const task = tasks[index];

    // Form fields mein purani values daalna
    taskTitleInput.value = task.title;
    taskDescInput.value = task.desc;
    taskDateInput.value = task.date;
    taskPrioritySelect.value = task.priority;

    // Editing index set karna aur button ka text change karna
    editingIndex = index;
    taskForm.querySelector('button[type="submit"]').textContent = 'Update Task';

    // User ko form ki taraf scroll ya focus karwana
    taskTitleInput.focus();
};

// --- 7. Toggle Task Status (Complete / Uncomplete) ---
window.toggleTaskStatus = function (index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasksToStorage();
    renderTasks();
};

// --- 8. Delete Task ---
window.deleteTask = function (index) {
    tasks.splice(index, 1); // Array se item remove karna
    saveTasksToStorage();
    renderTasks();
};


// --- Search Event Listener ---
searchInput.addEventListener('input', function () {
    renderTasks();
});

// --- Filter Buttons Event Listeners ---
filterButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Active class remove karna sab se
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Clicked button par active class lagana
        this.classList.add('active');

        // Current filter update karna
        currentFilter = this.getAttribute('data-filter');
        renderTasks();
    });
});

// --- Security Helper: Escape HTML to prevent XSS ---
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initial load par tasks render karna
renderTasks();