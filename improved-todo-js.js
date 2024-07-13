document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput');

    let tasksArray = [];

    // Load tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => addTaskToDOM(task));

    function toggleAddTaskBtn() {
        addTaskBtn.disabled = taskInput.value.trim() === '';
    }

    function createTaskObject(text) {
        return {
            id: Date.now(),
            text,
            completed: false,
            pinned: false,
            createdAt: new Date().toISOString()
        };
    }

    function addTaskToDOM(task) {
        const taskItem = document.createElement('li');
        taskItem.dataset.id = task.id;
        if (task.completed) taskItem.classList.add('completed');
        if (task.pinned) taskItem.classList.add('pinned');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));

        const taskSpan = document.createElement('span');
        taskSpan.textContent = task.text;
        taskSpan.classList.add('task-text');

        const actionDiv = document.createElement('div');
        actionDiv.classList.add('task-actions');

        const pinBtn = document.createElement('button');
        pinBtn.innerHTML = `<span class="material-icons">${task.pinned ? 'star' : 'star_border'}</span>`;
        pinBtn.addEventListener('click', () => toggleTaskPin(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actionDiv.append(pinBtn, deleteBtn);
        taskItem.append(checkbox, taskSpan, actionDiv);
        taskList.appendChild(taskItem);
        tasksArray.push(taskItem);
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = createTaskObject(taskText);
            addTaskToDOM(newTask);
            saveTasks();
            taskInput.value = '';
            toggleAddTaskBtn();
            reorderTasks();
        }
    }

    function toggleTaskComplete(id) {
        const taskIndex = findTaskIndex(id);
        if (taskIndex !== -1) {
            const tasks = getTasksFromStorage();
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks(tasks);
            tasksArray[taskIndex].classList.toggle('completed');
        }
    }

    function toggleTaskPin(id) {
        const taskIndex = findTaskIndex(id);
        if (taskIndex !== -1) {
            const tasks = getTasksFromStorage();
            tasks[taskIndex].pinned = !tasks[taskIndex].pinned;
            saveTasks(tasks);
            tasksArray[taskIndex].classList.toggle('pinned');
            reorderTasks();
        }
    }

    function deleteTask(id) {
        const taskIndex = findTaskIndex(id);
        if (taskIndex !== -1) {
            tasksArray[taskIndex].remove();
            tasksArray.splice(taskIndex, 1);
            const tasks = getTasksFromStorage().filter(task => task.id !== id);
            saveTasks(tasks);
        }
    }

    function findTaskIndex(id) {
        return tasksArray.findIndex(task => task.dataset.id === id.toString());
    }

    function reorderTasks() {
        const pinnedTasks = tasksArray.filter(task => task.classList.contains('pinned'));
        const unpinnedTasks = tasksArray.filter(task => !task.classList.contains('pinned'));
        
        pinnedTasks.forEach(task => taskList.appendChild(task));
        unpinnedTasks.forEach(task => taskList.appendChild(task));
    }

    function searchTasks() {
        const searchText = searchInput.value.toLowerCase();
        tasksArray.forEach(task => {
            const taskText = task.querySelector('.task-text').textContent.toLowerCase();
            task.style.display = taskText.includes(searchText) ? '' : 'none';
        });
    }

    function getTasksFromStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    function saveTasks(tasks = null) {
        if (!tasks) {
            tasks = tasksArray.map(taskElement => ({
                id: parseInt(taskElement.dataset.id),
                text: taskElement.querySelector('.task-text').textContent,
                completed: taskElement.classList.contains('completed'),
                pinned: taskElement.classList.contains('pinned'),
                createdAt: new Date().toISOString()
            }));
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    taskInput.addEventListener('input', toggleAddTaskBtn);
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !addTaskBtn.disabled) {
            addTask();
        }
    });
    searchInput.addEventListener('input', searchTasks);
});
