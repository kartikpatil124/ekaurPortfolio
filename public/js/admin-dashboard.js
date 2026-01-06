// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();

        if (!data.isAuthenticated) {
            window.location.href = '/admin';
        }
    } catch (error) {
        window.location.href = '/admin';
    }
}

// Load projects
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();

        const projectsList = document.getElementById('projectsList');
        projectsList.innerHTML = `
            <table class="table table-admin">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Technologies</th>
                        <th>Date</th>
                        <th>Featured</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(project => `
                        <tr>
                            <td>
                                <strong>${project.title}</strong>
                                <small class="d-block text-muted">${project.description.substring(0, 50)}...</small>
                            </td>
                            <td>
                                ${project.technologies ? project.technologies.map(tech =>
            `<span class="badge bg-dark me-1">${tech}</span>`
        ).join('') : ''}
                            </td>
                            <td>${new Date(project.createdAt).toLocaleDateString()}</td>
                            <td>
                                ${project.featured ?
                '<span class="badge bg-success">Featured</span>' :
                '<span class="badge bg-secondary">Regular</span>'}
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-2" 
                                        onclick="editProject('${project._id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" 
                                        onclick="deleteProject('${project._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Load messages
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        const messages = await response.json();

        const messagesList = document.getElementById('messagesList');
        messagesList.innerHTML = messages.map(message => `
            <div class="message-item ${message.read ? '' : 'unread'}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${message.name} <small class="text-muted">(${message.email})</small></h6>
                        <p class="mb-1"><strong>Subject:</strong> ${message.subject}</p>
                        <p class="mb-2">${message.message}</p>
                    </div>
                    <div>
                        <small class="text-muted">${new Date(message.createdAt).toLocaleString()}</small>
                        <br>
                        <button class="btn btn-sm btn-outline-secondary mt-2" 
                                onclick="markAsRead('${message._id}')">
                            ${message.read ? 'Read' : 'Mark as Read'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger mt-2" 
                                onclick="deleteMessage('${message._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Add new project
document.getElementById('addProjectForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        imageUrl: document.getElementById('projectImage').value,
        projectUrl: document.getElementById('projectUrl').value,
        githubUrl: document.getElementById('githubUrl').value,
        technologies: document.getElementById('projectTechnologies').value
            .split(',')
            .map(tech => tech.trim())
            .filter(tech => tech.length > 0),
        featured: document.getElementById('featuredProject').checked
    };

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            alert('Project added successfully!');
            document.getElementById('addProjectForm').reset();
            loadProjects();
        } else {
            alert('Error adding project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding project');
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async function () {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    loadProjects();
    loadMessages();
});

// Edit Project
window.editProject = async function (id) {
    try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error('Failed to fetch project');

        const project = await response.json();

        document.getElementById('editProjectId').value = project._id;
        document.getElementById('editProjectTitle').value = project.title;
        document.getElementById('editProjectImage').value = project.imageUrl;
        document.getElementById('editProjectDescription').value = project.description;
        document.getElementById('editProjectUrl').value = project.projectUrl || '';
        document.getElementById('editGithubUrl').value = project.githubUrl || '';
        document.getElementById('editProjectTechnologies').value = project.technologies.join(', ');
        document.getElementById('editFeaturedProject').checked = project.featured;

        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching project details:', error);
        alert('Failed to load project details');
    }
};

// Update Project
window.updateProject = async function () {
    const id = document.getElementById('editProjectId').value;
    const projectData = {
        title: document.getElementById('editProjectTitle').value,
        description: document.getElementById('editProjectDescription').value,
        imageUrl: document.getElementById('editProjectImage').value,
        projectUrl: document.getElementById('editProjectUrl').value,
        githubUrl: document.getElementById('editGithubUrl').value,
        technologies: document.getElementById('editProjectTechnologies').value
            .split(',')
            .map(tech => tech.trim())
            .filter(tech => tech.length > 0),
        featured: document.getElementById('editFeaturedProject').checked
    };

    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            alert('Project updated successfully!');
            // Close modal properly
            const modalEl = document.getElementById('editProjectModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            loadProjects();
        } else {
            alert('Error updating project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating project');
    }
};

// Delete Project
window.deleteProject = async function (id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProjects();
        } else {
            alert('Error deleting project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting project');
    }
};

// Mark Message as Read
window.markAsRead = async function (id) {
    try {
        const response = await fetch(`/api/messages/${id}/read`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true })
        });

        if (response.ok) {
            loadMessages();
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Delete Message
window.deleteMessage = async function (id) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
        const response = await fetch(`/api/messages/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadMessages();
        } else {
            alert('Error deleting message');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting message');
    }
};