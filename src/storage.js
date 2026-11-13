const STORAGE_KEY = 'todo-list-state-v1';

import { Project, Todo, User } from './todo.js';

export const isStorageAvailable = () => {
  try {
    const testKey = '__todo_storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
};

export const loadSavedData = () => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    if (!parsed || !parsed.user || !Array.isArray(parsed.user.projects)) {
      return null;
    }

    const restoredUser = new User(parsed.user.name, parsed.user.email, parsed.user.id);

    parsed.user.projects.forEach((projectData) => {
      const project = new Project(projectData.name);
      project.id = projectData.id;

      projectData.todos.forEach((todoData) => {
        const todo = new Todo({
          title: todoData.title,
          description: todoData.description,
          dueDate: todoData.dueDate,
          priority: todoData.priority,
          notes: todoData.notes,
          checklist: Boolean(todoData.checklist),
        });

        todo.id = todoData.id;
        project.addTodo(todo);
      });

      restoredUser.addProject(project);
    });

    return {
      user: restoredUser,
      selectedProjectId: parsed.selectedProjectId || restoredUser.projects[0]?.id || null,
      expandedTodoId: parsed.expandedTodoId || null,
    };
  } catch (error) {
    console.warn('Unable to load saved data:', error);
    return null;
  }
};

export const saveUserToStorage = (currentUser, currentState) => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const payload = {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        projects: currentUser.projects.map((project) => ({
          id: project.id,
          name: project.name,
          todos: project.todos.map((todo) => ({
            id: todo.id,
            title: todo.title,
            description: todo.description,
            dueDate: todo.dueDate,
            priority: todo.priority,
            notes: todo.notes,
            checklist: todo.checklist,
          })),
        })),
      },
      selectedProjectId: currentState.selectedProjectId,
      expandedTodoId: currentState.expandedTodoId,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to save data:', error);
  }
};
