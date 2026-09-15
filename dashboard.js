// Sample Database Array for Logged-In User Projects
let userProjects = [
    { 
        id: 1, 
        name: "Smart School System", 
        arch: "Single Page", 
        type: "Student Management", 
        target: "School", 
        platform: "Web", 
        created: "2026-08-01", 
        updated: "2026-08-10" 
    }
];

// Initialize Dashboard on Page Load
document.addEventListener('DOMContentLoaded', () => {
    renderProjectList();
});

// Render Dynamic Project Table with Extra Details
function renderProjectList() {
    const tableBody = document.getElementById('project-list');
    const totalStat = document.getElementById('stat-total-projects');
    
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    if (totalStat) {
        totalStat.innerText = userProjects.length;
    }

    if (userProjects.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-dim); padding: 30px;">No projects found. Click on <strong>+ New Project</strong> to create one!</td></tr>`;
        return;
    }

    userProjects.forEach((project) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${project.name}</strong>
                <br><small style="color: var(--text-dim);">${project.arch} | ${project.platform}</small>
            </td>
            <td><span class="badge" style="background: rgba(108, 92, 231, 0.2); color: #818cf8; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${project.type}</span></td>
            <td>${project.target}</td>
            <td>${project.updated}</td>
            <td class="action-btns">
                <button class="btn-icon" title="Open Code Editor" onclick="openEditor(${project.id})">
                    <i class="fa-solid fa-code"></i> Code
                </button>
                <button class="btn-icon" title="Delete Project" onclick="deleteProject(${project.id})" style="color: var(--danger);">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
// Tab Switching Navigation Handler (Projects & Settings)
function switchTab(tabName) {
    const viewProjects = document.getElementById('view-projects');
    const viewSettings = document.getElementById('view-settings');
    const navProjects = document.getElementById('nav-projects');
    const navSettings = document.getElementById('nav-settings');

    if (tabName === 'projects') {
        viewProjects.classList.remove('hidden');
        viewSettings.classList.add('hidden');
        navProjects.classList.add('active');
        navSettings.classList.remove('active');
    } else if (tabName === 'settings') {
        viewProjects.classList.add('hidden');
        viewSettings.classList.remove('hidden');
        navProjects.classList.remove('active');
        navSettings.classList.add('active');
    }
}

// Modal Control Functions
function openCreateModal() {
    document.getElementById('create-modal').classList.remove('hidden');
}

function closeCreateModal() {
    document.getElementById('create-modal').classList.add('hidden');
    document.getElementById('create-project-form').reset();
}

// Create Project Logic with Duplicate Name Validation
function handleCreateProject(e) {
    e.preventDefault();

    // Fetch form input values
    const projectName = document.getElementById('project-name').value.trim();
    const projectArch = document.getElementById('project-arch').value;
    const projectType = document.getElementById('project-type').value;
    const projectTarget = document.getElementById('project-target').value;
    const projectPlatform = document.getElementById('project-platform').value;

    if (!projectName) return;

    // Check Duplicate Project Name for Current User
    const isDuplicate = userProjects.some(
        project => project.name.toLowerCase() === projectName.toLowerCase()
    );

    if (isDuplicate) {
        alert(`"${projectName}" This Project is already Exist! Please, Start with new project name.`);
        document.getElementById('project-name').focus();
        return; // Prevent form submission
    }

    // Construct Project Object for Storing in Database
    const newProject = {
        id: Date.now(),
        name: projectName,
        arch: projectArch,
        type: projectType,
        target: projectTarget,
        platform: projectPlatform,
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0]
    };

    // Save to User Project Database / Array
    userProjects.unshift(newProject);

    // Refresh Table View
    renderProjectList();

    // Close Modal and Alert User
    closeCreateModal();
    alert(`New Project "${projectName}" Created Successfully!`);
}

// Delete Project Row
function deleteProject(id) {
    if (confirm("Are you sure you want to delete this project?")) {
        userProjects = userProjects.filter(p => p.id !== id);
        renderProjectList();
    }
}

// Save Settings Action
function saveSettings(e) {
    e.preventDefault();
    const updatedName = document.getElementById('settings-username').value.trim();
    if(updatedName) {
        document.getElementById('user-display-name').innerText = updatedName;
        document.getElementById('user-avatar').innerText = updatedName.charAt(0).toUpperCase();
        alert("Settings saved successfully!");
    }
}

// Launch Code Editor Workspace
function openEditor(id) {
    window.location.href = `editor.html?project_id=${id}`;
}

// User Actions: Logout & Delete Account
function logoutUser() {
    if (confirm("Are you sure you want to log out?")) {
        window.location.href = "login.html";
    }
}

function deleteUserAccount() {
    const confirmation = confirm("WARNING: Are you sure you want to delete your user account? All stored projects will be permanently removed!");
    if (confirmation) {
        alert("Your account has been deleted.");
        window.location.href = "login.html";
    }
}