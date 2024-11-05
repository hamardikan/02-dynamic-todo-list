class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem("todos")) || [];
        this.filter = 'all';

        //get DOM elements
        this.initializeElements();

        //setUP event listeners
        this.bindEvents();

        //inital renders
        this.render();
    }

    initializeElements() {
        this.form = document.getElementById('todoForm');
        this.input = document.getElementById("todoInput");
        this.list = document.getElementById("todoList");
        this.filters = document.querySelector('.filters');

        this.counter = document.getElementById('taskCount');
    }

    bindEvents() {
        //form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo(this.input.value.trim());
        });

        //filter clicks

        this.filters.addEventListener('click', (e) => {
            if (e.target.matches('button')) {
                this.setFilter(e.target.dataset.filter);
            }
        });

        //todo list events (using event delegation)
        this.list.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            if (!todoItem) return;

            const id = Number(todoItem.dataset.id);

            if (e.target.matches('.delete-btn')) {
                this.deleteTodo(id);
            } else if (e.target.matches('.checkbox')) {
                this.toggleTodo(id);
            }
        });

        this.list.addEventListener('dblclick', (e) => {
            if (e.target.matches('.todo-text')) {
                this.startEditing(e.target);
            }
        });
    };

    startEditing(element){
        const todoItem = element.closest('.todo-item');
        const id = Number(todoItem.dataset.id);
        const todo = this.todos.find(t => t.id === id);

        const input = document.createElement("input");
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-input';

        element.replaceWith(input);
        input.focus();

        input.addEventListener('keydown', (e) => {
            if(e.key === "Enter") {
                this.saveEdit(id, input.value.trim());
            } else if( e.key ===  "Escape") {
                this.render(); //cancel by re-rendering
            }
        });

        input.addEventListener('blur', () => {
            this.render(); //cancel on blur
        });
    }

    saveEdit(id, newText){
        if(!newText) return;

        this.todos = this.todos.map(todo =>
            todo.id === id
                ? {...todo, text: newText}
                : todo
        );

        this.save();
        this.render();
    }

    addTodo(text) {
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false
        };

        this.todos.push(todo);

        this.input.value = '';

        this.save();
        this.render();
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id
                ? { ...todo, completed: !todo.completed }
                : todo
        )
        this.save();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);

        this.save();
        this.render();
    }

    setFilter(filterType) {
        this.filter = filterType;

        const buttons = this.filters.querySelectorAll("button");
        buttons.forEach(button => {
            button.classList.toggle('active',
                button.dataset.filter === filterType);
        });
        this.render();
    }

    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    render() {
        this.list.innerHTML = '';

        const filteredTodos = this.getFilteredTodos();

        filteredTodos.forEach(todo => {
            const element = this.createTodoElement(todo);
            this.list.appendChild(element);
        });

        this.updateCounter();
    }

    getFilteredTodos() {
        switch (this.filter) {
            case "active":
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = "todo-item";
        li.dataset.id = todo.id;

        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text ${todo.completed ? "completed" : ''}">
                ${this.escapeHtml(todo.text)}
            </span>
            <button class="delete-btn">x</button>
        `;

        return li;
    }

    updateCounter() {
        const activeCount = this.todos.filter(todo => !todo.completed).length;
        this.counter.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const todoApp = new TodoList();