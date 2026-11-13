import { format, isValid, parseISO } from 'date-fns';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDueDate = (dueDate) => {
  if (!dueDate) {
    return 'No due date';
  }

  const parsedDate = parseISO(dueDate);

  if (!isValid(parsedDate)) {
    return 'No due date';
  }

  return `Due ${format(parsedDate, 'MMM d, yyyy')}`;
};

export class Todo {
  constructor({
    title,
    description = '',
    dueDate = '',
    priority = 'normal',
    notes = '',
    checklist = false,
  } = {}) {
    this.id = this.generateId();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.notes = notes;
    this.checklist = checklist;
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  update(field, value) {
    if (field === 'checklist') {
      this.checklist = Boolean(value);
      return this;
    }

    if (field in this) {
      this[field] = value;
    }

    return this;
  }

  toggleChecklist() {
    this.checklist = !this.checklist;
    return this.checklist;
  }
}

export class Project {
  constructor(name) {
    this.id = this.generateId();
    this.name = name;
    this.todos = [];
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  addTodo(todo) {
    this.todos.push(todo);
    return this;
  }

  removeTodo(todoId) {
    this.todos = this.todos.filter((todo) => todo.id !== todoId);
    return this;
  }

  getTodo(todoId) {
    return this.todos.find((todo) => todo.id === todoId);
  }

  updateTodo(todoId, updates) {
    const todo = this.getTodo(todoId);

    if (!todo) {
      return null;
    }

    Object.entries(updates).forEach(([field, value]) => {
      todo.update(field, value);
    });

    return todo;
  }
}

export class Table {
  constructor(title = 'Todo Table') {
    this.title = title;
    this.rows = [];
  }

  addTodo(todo) {
    this.rows.push(todo);
    return this;
  }

  removeTodo(todoId) {
    this.rows = this.rows.filter((todo) => todo.id !== todoId);
    return this;
  }

  render(project, expandedTodoId = null) {
    const todos = project ? project.todos : this.rows;

    if (todos.length === 0) {
      return `
        <div class="empty-state">No todos yet.</div>
      `;
    }

    return todos
      .map((todo) => {
        const isExpanded = expandedTodoId === todo.id;

        return `
          <div class="todo-item priority-${todo.priority || 'normal'} ${isExpanded ? 'expanded' : ''}">
            <div class="todo-summary">
              <div class="todo-main">
                <span class="todo-title">${escapeHtml(todo.title || 'Untitled todo')}</span>
              </div>

              <div class="todo-meta">
                <span class="due-date">${formatDueDate(todo.dueDate)}</span>
                <label class="check-toggle">
                  <input
                    type="checkbox"
                    data-field="checklist"
                    data-todo-id="${todo.id}"
                    ${todo.checklist ? 'checked' : ''}
                    aria-label="Checklist for ${escapeHtml(todo.title || 'todo')}"
                  />
                  Done
                </label>
              </div>

              <div class="todo-actions">
                <button type="button" class="secondary-btn" data-action="toggle-details" data-todo-id="${todo.id}">
                  ${isExpanded ? 'Hide details' : 'Details'}
                </button>
                <button type="button" class="danger-btn" data-action="delete-todo" data-todo-id="${todo.id}">
                  Remove
                </button>
              </div>
            </div>

            <div class="todo-details ${isExpanded ? 'open' : ''}">
              <div class="detail-grid">
                <label>
                  Title
                  <input
                    type="text"
                    value="${escapeHtml(todo.title || '')}"
                    data-field="title"
                    data-todo-id="${todo.id}"
                    aria-label="Todo title"
                  />
                </label>

                <label>
                  Description
                  <input
                    type="text"
                    value="${escapeHtml(todo.description || '')}"
                    data-field="description"
                    data-todo-id="${todo.id}"
                    aria-label="Todo description"
                  />
                </label>

                <label>
                  Due Date
                  <input
                    type="date"
                    value="${escapeHtml(todo.dueDate || '')}"
                    data-field="dueDate"
                    data-todo-id="${todo.id}"
                    aria-label="Todo due date"
                  />
                </label>

                <label>
                  Priority
                  <select data-field="priority" data-todo-id="${todo.id}" aria-label="Todo priority">
                    <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="normal" ${todo.priority === 'normal' ? 'selected' : ''}>Normal</option>
                    <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
                  </select>
                </label>

                <label class="full-width">
                  Notes
                  <textarea
                    rows="3"
                    data-field="notes"
                    data-todo-id="${todo.id}"
                    aria-label="Todo notes"
                  >${escapeHtml(todo.notes || '')}</textarea>
                </label>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }
}

export class User {
  constructor(name, email, id = null) {
    this.id = id || this.generateId();
    this.name = name;
    this.email = email;
    this.projects = [];
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  addProject(project) {
    this.projects.push(project);
    return this;
  }

  removeProject(projectId) {
    this.projects = this.projects.filter((project) => project.id !== projectId);
    return this;
  }

  getProject(projectId) {
    return this.projects.find((project) => project.id === projectId);
  }
}
