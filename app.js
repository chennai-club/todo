(function () {
  "use strict";

  const STORAGE_KEY = "todos";

  // State
  let todos = loadTodos();
  let currentFilter = "all";

  // DOM elements
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const main = document.getElementById("main");
  const todoList = document.getElementById("todo-list");
  const footer = document.getElementById("footer");
  const toggleAll = document.getElementById("toggle-all");
  const todoCount = document.getElementById("todo-count");
  const filters = document.getElementById("filters");
  const clearCompletedBtn = document.getElementById("clear-completed");

  // Persistence
  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  // Render
  function render() {
    const filtered = getFilteredTodos();
    const activeCount = todos.filter((t) => !t.completed).length;
    const completedCount = todos.length - activeCount;

    // Visibility
    main.classList.toggle("visible", todos.length > 0);
    footer.classList.toggle("visible", todos.length > 0);

    // Toggle all
    toggleAll.checked = todos.length > 0 && activeCount === 0;

    // Count
    todoCount.textContent =
      activeCount === 1 ? "1 item left" : `${activeCount} items left`;

    // Clear completed button
    clearCompletedBtn.classList.toggle("hidden", completedCount === 0);

    // Filter buttons
    filters.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === currentFilter);
    });

    // Todo list
    todoList.innerHTML = "";
    filtered.forEach((todo) => {
      todoList.appendChild(createTodoElement(todo));
    });
  }

  function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    text.addEventListener("dblclick", () => startEditing(li, todo));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "todo-delete";
    deleteBtn.textContent = "\u00d7";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);

    return li;
  }

  function getFilteredTodos() {
    switch (currentFilter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }

  // Actions
  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    todos.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text: trimmed,
      completed: false,
    });
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }

  function startEditing(li, todo) {
    const textSpan = li.querySelector(".todo-text");
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "todo-edit-input";
    editInput.value = todo.text;

    textSpan.replaceWith(editInput);
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    function finishEdit() {
      const newText = editInput.value.trim();
      if (newText) {
        todo.text = newText;
        saveTodos();
      } else {
        deleteTodo(todo.id);
      }
      render();
    }

    editInput.addEventListener("blur", finishEdit);
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        editInput.blur();
      } else if (e.key === "Escape") {
        editInput.value = todo.text;
        editInput.blur();
      }
    });
  }

  // Event listeners
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = "";
  });

  toggleAll.addEventListener("change", () => {
    const allCompleted = todos.every((t) => t.completed);
    todos.forEach((t) => (t.completed = !allCompleted));
    saveTodos();
    render();
  });

  filters.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      currentFilter = e.target.dataset.filter;
      render();
    }
  });

  clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  });

  // Initial render
  render();
})();
