// Configuration - Automatically detect backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : '';  // Empty string means same origin in production

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the homepage or projects page and fetch accordingly
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
        // Check if we're on the projects.html page (has filter container)
        const isProjectsPage = document.getElementById('filter-container');
        if (isProjectsPage) {
            fetchAllProjects();
        } else {
            // Homepage - Fetch only featured projects (max 3)
            fetchFeaturedProjects();
        }
    }
});

// Fetch featured projects for homepage (max 3)
async function fetchFeaturedProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        const projects = await response.json();

        // Filter featured projects first, then limit to 3
        let displayProjects = projects.filter(p => p.featured);
        if (displayProjects.length < 3) {
            // If not enough featured, add non-featured to make up 3
            const nonFeatured = projects.filter(p => !p.featured);
            displayProjects = [...displayProjects, ...nonFeatured].slice(0, 3);
        } else {
            displayProjects = displayProjects.slice(0, 3);
        }

        renderProjects(displayProjects, true);
    } catch (error) {
        console.error('Error fetching projects:', error);
        showErrorMessage();
    }
}

// Fetch all projects for projects page
async function fetchAllProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        const projects = await response.json();

        // Store all projects globally for filtering
        window.allProjects = projects;

        // Extract unique technologies for filter buttons
        generateFilterButtons(projects);

        renderProjects(projects, false);
    } catch (error) {
        console.error('Error fetching projects:', error);
        showErrorMessage();
    }
}

// Generate filter buttons based on available technologies
function generateFilterButtons(projects) {
    const filterContainer = document.getElementById('filter-buttons');
    if (!filterContainer) return;

    // Collect all unique technologies
    const allTechs = new Set();
    projects.forEach(project => {
        if (project.technologies && Array.isArray(project.technologies)) {
            project.technologies.forEach(tech => allTechs.add(tech));
        }
        if (project.tags && Array.isArray(project.tags)) {
            project.tags.forEach(tag => allTechs.add(tag));
        }
    });

    // Create filter buttons
    let buttonsHTML = '<button class="filter-btn active" data-filter="all">All</button>';
    allTechs.forEach(tech => {
        buttonsHTML += `<button class="filter-btn" data-filter="${tech}">${tech}</button>`;
    });

    filterContainer.innerHTML = buttonsHTML;

    // Add click event listeners to filter buttons
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            filterProjects(filter);
        });
    });
}

// Filter projects by technology
function filterProjects(filter) {
    const projects = window.allProjects || [];

    if (filter === 'all') {
        renderProjects(projects, false);
        return;
    }

    const filtered = projects.filter(project => {
        const techs = project.technologies || [];
        const tags = project.tags || [];
        return techs.includes(filter) || tags.includes(filter);
    });

    renderProjects(filtered, false);
}

// Render projects to the grid
function renderProjects(projects, showFeaturedBadge = true) {
    const grid = document.querySelector('.project-grid');
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = '';

    if (projects.length === 0) {
        grid.innerHTML = '<p class="text-center text-gray-500" style="grid-column: 1/-1; padding: 40px;">No projects found.</p>';
        return;
    }

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card visible';

        // Handle tags/technologies - combine both
        let allTags = [];
        if (project.technologies && Array.isArray(project.technologies)) {
            allTags = [...allTags, ...project.technologies];
        }
        if (project.tags && Array.isArray(project.tags)) {
            allTags = [...allTags, ...project.tags];
        }
        // Remove duplicates
        allTags = [...new Set(allTags)];

        const tagsHtml = allTags.map(tag => `<span class="project-tag">${tag}</span>`).join('');

        // Use a default image if none provided
        const imageUrl = project.imageUrl || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80';

        // Featured badge (only on homepage)
        const featuredBadge = (showFeaturedBadge && project.featured) ? '<div class="featured-badge">FEATURED</div>' : '';

        // Project links
        let linksHtml = '';
        if (project.projectUrl || project.demoUrl) {
            const demoLink = project.projectUrl || project.demoUrl;
            linksHtml += `<a href="${demoLink}" class="project-link" title="Live Demo" target="_blank"><i class="fas fa-external-link-alt"></i></a>`;
        }
        if (project.githubUrl) {
            linksHtml += `<a href="${project.githubUrl}" class="project-link" title="GitHub Repository" target="_blank"><i class="fab fa-github"></i></a>`;
        }

        projectCard.innerHTML = `
            ${featuredBadge}
            <div class="project-img-container">
                <img src="${imageUrl}" alt="${project.title}" class="project-img">
                <div class="project-overlay">
                    <div class="project-tags">
                        ${tagsHtml}
                    </div>
                </div>
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">
                    ${project.description}
                </p>
                <div class="project-links">
                    ${linksHtml}
                </div>
            </div>
        `;

        grid.appendChild(projectCard);
    });
}

// Show error message
function showErrorMessage() {
    const grid = document.querySelector('.project-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p class="text-red-500" style="color: #ff4757; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
                    Failed to load projects. Please try again later.
                </p>
                <button onclick="location.reload()" class="see-more-btn" style="margin-top: 0; padding: 12px 30px; font-size: 1rem;">
                    <i class="fas fa-redo" style="margin-right: 10px;"></i>Retry
                </button>
            </div>
        `;
    }
}

// Scroll to About section
function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
}
