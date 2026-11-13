import { Project, User } from './todo.js';

export class TodoList {
  constructor(user, state = {}) {
    this.user = user;
    this.state = {
      selectedProjectId: state.selectedProjectId ?? user.projects[0]?.id ?? null,
      expandedTodoId: state.expandedTodoId ?? null,
    };
  }

  getCurrentProject() {
    return this.user.projects.find((project) => project.id === this.state.selectedProjectId) || this.user.projects[0];
  }

  ensureProjectSelection() {
    if (!this.user.projects.length) {
      const fallbackProject = new Project('New Project');
      this.user.addProject(fallbackProject);
    }

    if (!this.user.projects.some((project) => project.id === this.state.selectedProjectId)) {
      this.state.selectedProjectId = this.user.projects[0].id;
    }
  }

  addProject(name) {
    const project = new Project(name);
    this.user.addProject(project);
    this.state.selectedProjectId = project.id;
    return project;
  }

  removeProject(projectId) {
    this.user.removeProject(projectId);
    const remaining = this.user.projects[0];
    this.state.selectedProjectId = remaining ? remaining.id : null;
    this.state.expandedTodoId = null;
  }

  selectProject(projectId) {
    this.state.selectedProjectId = projectId;
  }

  addTodo(todo) {
    const project = this.getCurrentProject();
    project.addTodo(todo);
  }

  removeTodo(todoId) {
    const project = this.getCurrentProject();
    project.removeTodo(todoId);

    if (this.state.expandedTodoId === todoId) {
      this.state.expandedTodoId = null;
    }
  }

  toggleDetails(todoId) {
    this.state.expandedTodoId = this.state.expandedTodoId === todoId ? null : todoId;
  }
}
