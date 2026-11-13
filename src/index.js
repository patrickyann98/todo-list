import './styles.css';
import { Project, Todo, User } from './todo.js';
import { TodoList } from './list.js';
import { renderApp } from './display.js';
import { loadSavedData, saveUserToStorage } from './storage.js';

const createDefaultUser = () => {
  const user = new User('Patricia', 'patricia@example.com', 'user-001');
  const homeworkProject = new Project('Homework');

  homeworkProject.addTodo(
    new Todo({
      title: 'Math Assignment',
      description: 'Finish chapter 4 exercises',
      dueDate: '2026-11-10',
      priority: 'high',
      notes: 'Review quadratic equations before class',
      checklist: true,
    }),
  );

  homeworkProject.addTodo(
    new Todo({
      title: 'History Reading',
      description: 'Read pages 48-70 and summarize key events',
      dueDate: '2026-11-12',
      priority: 'normal',
      notes: 'Use notes from the lecture',
      checklist: false,
    }),
  );

  homeworkProject.addTodo(
    new Todo({
      title: 'Science Lab Report',
      description: 'Write up experiment results and conclusion',
      dueDate: '2026-11-15',
      priority: 'high',
      notes: 'Attach chart and observation table',
      checklist: true,
    }),
  );

  user.addProject(homeworkProject);
  return user;
};

const app = document.querySelector('#app');
const savedData = loadSavedData();
const baseUser = savedData ? savedData.user : createDefaultUser();
const todoList = new TodoList(baseUser, savedData || {
  selectedProjectId: baseUser.projects[0]?.id ?? null,
  expandedTodoId: null,
});

const render = () => {
  todoList.ensureProjectSelection();
  const currentProject = todoList.getCurrentProject();
  todoList.state.selectedProjectId = currentProject.id;
  saveUserToStorage(todoList.user, todoList.state);
  app.innerHTML = renderApp(todoList);
};

app.addEventListener('input', (event) => {
  const field = event.target.dataset.field;
  const todoId = event.target.dataset.todoId;

  if (!field || !todoId) {
    return;
  }

  const currentProject = todoList.getCurrentProject();
  const todo = currentProject.getTodo(todoId);

  if (!todo) {
    return;
  }

  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  todo.update(field, value);
  saveUserToStorage(todoList.user, todoList.state);
});

app.addEventListener('click', (event) => {
  const actionTarget = event.target.closest('[data-action]');

  if (!actionTarget) {
    return;
  }

  const { action, projectId, todoId } = actionTarget.dataset;

  if (action === 'select-project') {
    todoList.selectProject(projectId);
    saveUserToStorage(todoList.user, todoList.state);
    render();
    return;
  }

  if (action === 'delete-project') {
    todoList.removeProject(projectId);
    saveUserToStorage(todoList.user, todoList.state);
    render();
    return;
  }

  if (action === 'toggle-details') {
    todoList.toggleDetails(todoId);
    saveUserToStorage(todoList.user, todoList.state);
    render();
    return;
  }

  if (action === 'delete-todo') {
    todoList.removeTodo(todoId);
    saveUserToStorage(todoList.user, todoList.state);
    render();
  }
});

app.addEventListener('submit', (event) => {
  event.preventDefault();

  if (event.target.matches('#project-form')) {
    const form = event.target;
    const projectName = form.elements.projectName.value.trim();

    if (!projectName) {
      return;
    }

    todoList.addProject(projectName);
    saveUserToStorage(todoList.user, todoList.state);
    form.reset();
    render();
    return;
  }

  if (event.target.matches('#todo-form')) {
    const form = event.target;
    const title = form.elements.title.value.trim();

    if (!title) {
      return;
    }

    todoList.addTodo(
      new Todo({
        title,
        description: form.elements.description.value.trim(),
        dueDate: form.elements.dueDate.value,
        priority: form.elements.priority.value,
        notes: form.elements.notes.value.trim(),
        checklist: form.elements.checklist.checked,
      }),
    );

    saveUserToStorage(todoList.user, todoList.state);
    form.reset();
    render();
  }
});

render();
console.log('To-do list is running');
console.log({ todoList });
