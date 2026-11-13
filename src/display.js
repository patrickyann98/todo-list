import { Table } from './todo.js';

export const renderProjectButtons = (list) =>
  list.user.projects
    .map(
      (project) => `
        <button
          type="button"
          class="project-tab ${project.id === list.state.selectedProjectId ? 'active' : ''}"
          data-action="select-project"
          data-project-id="${project.id}"
        >
          ${project.name}
        </button>
      `,
    )
    .join('');

export const renderApp = (list) => {
  const currentProject = list.getCurrentProject();
  const table = new Table(`${currentProject.name} Tasks`);

  return `
    <main class="app">
      <div class="user-card">
        <p class="label">User</p>
        <h1>${list.user.name}</h1>
        <p><strong>ID:</strong> ${list.user.id}</p>
        <p><strong>Email:</strong> ${list.user.email}</p>
      </div>

      <section class="projects-panel">
        <div class="panel-header">
          <h2>Projects</h2>
          <form id="project-form" class="inline-form">
            <input type="text" name="projectName" placeholder="New project name" required />
            <button type="submit">Add Project</button>
          </form>
        </div>

        <div class="project-list">
          ${renderProjectButtons(list)}
        </div>
      </section>

      <section class="todos-panel">
        <div class="panel-header">
          <h2>${currentProject.name}</h2>
          <button
            type="button"
            class="danger-btn"
            data-action="delete-project"
            data-project-id="${currentProject.id}"
          >
            Remove Project
          </button>
        </div>

        <div class="todo-list">
          ${table.render(currentProject, list.state.expandedTodoId)}
        </div>

        <form id="todo-form" class="todo-form">
          <input type="text" name="title" placeholder="New todo title" required />
          <input type="text" name="description" placeholder="Description" />
          <input type="date" name="dueDate" />
          <select name="priority">
            <option value="low">Low</option>
            <option value="normal" selected>Normal</option>
            <option value="high">High</option>
          </select>
          <input type="text" name="notes" placeholder="Notes" />
          <label class="checkbox-row">
            <input type="checkbox" name="checklist" />
            Checklist
          </label>
          <button type="submit">Add Todo</button>
        </form>
      </section>
    </main>
  `;
};
