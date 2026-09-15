const API_URL = 'http://localhost:5000/api/auth';
const PROJECT_API_URL = 'http://localhost:5000/api/projects';

let currentProject = null;
let activeTab = 'html'; 
let multiFiles = { html: '', css: '', js: '' };

// Page Load Session Check
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
        showIDE(user.name);
    }
});

function switchTab(tab) {
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab === 'login');
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab !== 'login');
}

// Auth Logic
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showIDE(data.user.name);
        } else { alert(data.message); }
    } catch (err) { alert("Server Error"); }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) { alert("Registration successful!"); switchTab('login'); }
        else { alert(data.message); }
    } catch (err) { alert("Server Error"); }
}

function showIDE(userName) {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('ide-container').classList.remove('hidden');
    document.getElementById('user-display-name').innerText = userName;
}

function handleLogout() {
    localStorage.clear();
    location.reload();
}

// Modal Controls
function openNewProjectModal() { document.getElementById('new-project-modal').classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// 1. Create New Project
async function createNewProject() {
    const title = document.getElementById('new-title-input').value;
    const projectType = document.querySelector('input[name="projType"]:checked').value;
    const user = JSON.parse(localStorage.getItem('user'));

    if (!title) return alert("Enter project name");

    try {
        const res = await fetch(`${PROJECT_API_URL}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, projectType, userId: user.id })
        });
        const data = await res.json();
        closeModal('new-project-modal');
        loadProjectIntoEditor(data.project);
    } catch (err) { alert("Error creating project"); }
}

// 2. Load Project into Editor
function loadProjectIntoEditor(proj) {
    currentProject = proj;
    document.getElementById('current-project-title').innerText = `${proj.title} (${proj.projectType.toUpperCase()})`;
    const fileTabsBar = document.getElementById('file-tabs-bar');

    if (proj.projectType === 'single') {
        fileTabsBar.classList.add('hidden');
        document.getElementById('code-input').value = proj.code || '';
    } else {
        fileTabsBar.classList.remove('hidden');
        multiFiles = proj.files || { html: '<h1>Hello</h1>', css: '', js: '' };
        switchFileTab('html');
    }
    runCode();
}

// 3. Multi-File Tab Switcher
function switchFileTab(tab, e) {
    const codeArea = document.getElementById('code-input');
    multiFiles[activeTab] = codeArea.value;

    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (e && e.target) {
        e.target.classList.add('active');
    } else {
        const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.innerText.toLowerCase().includes(tab));
        if (activeBtn) activeBtn.classList.add('active');
    }

    codeArea.value = multiFiles[tab] || '';
}

// 4. Save Project
async function saveCurrentProject() {
    if (!currentProject) return alert("No active project!");

    const codeArea = document.getElementById('code-input').value;
    let payload = { projectId: currentProject._id };

    if (currentProject.projectType === 'single') {
        payload.code = codeArea;
    } else {
        multiFiles[activeTab] = codeArea;
        payload.files = multiFiles;
    }

    try {
        const res = await fetch(`${PROJECT_API_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message);
    } catch (err) { alert("Error saving project"); }
}

// 5. Open Project Dashboard
async function openDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const res = await fetch(`${PROJECT_API_URL}/user/${user.id}/${user.email}`);
        const { myProjects, sharedProjects } = await res.json();

        const grid = document.getElementById('project-grid');
        grid.innerHTML = '';

        const allProjects = [...myProjects, ...sharedProjects];
        
        allProjects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <h4>${proj.title}</h4>
                <p>Type: ${proj.projectType.toUpperCase()}</p>
                <div class="card-actions">
                    <button onclick="selectProject('${proj._id}')" class="btn-primary">Open</button>
                    <button onclick="copyProject('${proj._id}')" class="btn-secondary">Copy</button>
                    <button onclick="deleteProject('${proj._id}')" class="btn-danger">Delete</button>
                </div>
            `;
            grid.appendChild(card);
        });

        document.getElementById('dashboard-modal').classList.remove('hidden');
    } catch (err) { alert("Failed to fetch projects."); }
}

async function selectProject(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    const res = await fetch(`${PROJECT_API_URL}/user/${user.id}/${user.email}`);
    const { myProjects, sharedProjects } = await res.json();
    const proj = [...myProjects, ...sharedProjects].find(p => p._id === id);
    if (proj) {
        closeModal('dashboard-modal');
        loadProjectIntoEditor(proj);
    }
}

async function copyProject(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    await fetch(`${PROJECT_API_URL}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, userId: user.id })
    });
    openDashboard();
}

async function deleteProject(id) {
    if (confirm("Are you sure you want to delete this project?")) {
        await fetch(`${PROJECT_API_URL}/${id}`, { method: 'DELETE' });
        openDashboard();
    }
}

// 6. Share Project
async function shareCurrentProject() {
    if (!currentProject) return alert("No active project!");
    const emailToShare = prompt("Enter the email address of the user you want to share with:");
    if (emailToShare) {
        const res = await fetch(`${PROJECT_API_URL}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: currentProject._id, emailToShare })
        });
        const data = await res.json();
        alert(data.message);
    }
}

// 7. Live Code Runner
function runCode() {
    const preview = document.getElementById('preview-window').contentWindow.document;
    preview.open();

    if (currentProject && currentProject.projectType === 'multi') {
        multiFiles[activeTab] = document.getElementById('code-input').value;
        const fullContent = `
            <!DOCTYPE html>
            <html>
            <head><style>${multiFiles.css || ''}</style></head>
            <body>
                ${multiFiles.html || ''}
                <script>${multiFiles.js || ''}<\/script>
            </body>
            </html>
        `;
        preview.write(fullContent);
    } else {
        preview.write(document.getElementById('code-input').value);
    }
    preview.close();
}