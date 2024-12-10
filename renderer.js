document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const pendingTasksBody = document.getElementById('pending-tasks-body');
    const completedTasksBody = document.getElementById('completed-tasks-body');
    const taskCategorySelect = document.getElementById('task-category');
    const taskSearchInput = document.getElementById('task-search');

    const totalTasksElement = document.getElementById('total-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const pendingTasksElement = document.getElementById('pending-tasks');

    const calendarLink = document.getElementById('calendar-link');
    const calendarModal = new bootstrap.Modal(document.getElementById('calendarModal'));
    const currentMonthElement = document.getElementById('current-month');
    const calendarDaysElement = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let tasks = [];
    let currentDate = new Date();

    // Load tasks when app starts
    window.electronAPI.loadTodos()
        .then(loadedTasks => {
            if (loadedTasks) {
                tasks = loadedTasks;
                renderTasks();
            }
        });

    function renderTasks() {
        pendingTasksBody.innerHTML = '';
        completedTasksBody.innerHTML = '';

        const pendingTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);

        pendingTasks.forEach(task => {
            const row = createTaskRow(task, false);
            pendingTasksBody.appendChild(row);
        });

        completedTasks.forEach(task => {
            const row = createTaskRow(task, true);
            completedTasksBody.appendChild(row);
        });

        updateTaskStats();
    }

    function createTaskRow(task, isCompleted) {
        const row = document.createElement('tr');
        row.dataset.id = task.id;

        row.innerHTML = `
            <td>${task.text}</td>
            <td>${task.category || 'Uncategorized'}</td>
            ${!isCompleted ? `
            <td>
                <button class="btn btn-sm btn-success complete-btn me-2">
                    <i class="bi bi-check-circle"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
            ` : ''}
        `;

        if (!isCompleted) {
            const completeBtn = row.querySelector('.complete-btn');
            const deleteBtn = row.querySelector('.delete-btn');

            completeBtn.addEventListener('click', () => completeTask(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        }

        return row;
    }

    function addTask() {
        const taskText = newTaskInput.value.trim();
        const taskCategory = taskCategorySelect.value;

        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                category: taskCategory,
                completed: false
            };

            tasks.push(newTask);
            renderTasks();
            saveTasks();

            newTaskInput.value = '';
            taskCategorySelect.selectedIndex = 0;
        }
    }

    function completeTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = true;
            renderTasks();
            saveTasks();
        }
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
        saveTasks();
    }

    function saveTasks() {
        window.electronAPI.saveTodos(tasks);
        updateTaskStats();
    }

    function updateTaskStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        totalTasksElement.textContent = totalTasks;
        completedTasksElement.textContent = completedTasks;
        pendingTasksElement.textContent = pendingTasks;
    }

    // Search functionality
    taskSearchInput.addEventListener('input', () => {
        const searchTerm = taskSearchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#pending-tasks-body tr, #completed-tasks-body tr');
        
        rows.forEach(row => {
            const taskText = row.querySelector('td:first-child').textContent.toLowerCase();
            row.style.display = taskText.includes(searchTerm) ? '' : 'none';
        });
    });

    addTaskButton.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Function to render calendar
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update month and year display
        currentMonthElement.textContent = new Intl.DateTimeFormat('en-US', { 
            month: 'long', 
            year: 'numeric' 
        }).format(currentDate);

        // Clear previous calendar days
        calendarDaysElement.innerHTML = '';

        // Get first day of the month and total days
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay();
        const totalDaysInMonth = lastDayOfMonth.getDate();

        // Add empty cells for days before the first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarDaysElement.appendChild(emptyCell);
        }

        // Add days of the month
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = day;

            // Highlight today's date
            const checkDate = new Date(year, month, day);
            if (checkDate.toDateString() === new Date().toDateString()) {
                dayElement.classList.add('today');
            }

            calendarDaysElement.appendChild(dayElement);
        }
    }

    // Event listeners for navigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Open calendar when calendar link is clicked
    calendarLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderCalendar();
        calendarModal.show();
    });


});