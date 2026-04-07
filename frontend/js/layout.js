const sidebarHTML = `
<div class="sidebar glass">
    <div class="brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        <span>ServiceSync</span>
    </div>
    <nav>
        <a href="dashboard.html" class="nav-item" id="nav-dashboard">Dashboard</a>
        <a href="analytics.html" class="nav-item" id="nav-analytics">Analytics</a>
        <a href="services.html" class="nav-item" id="nav-services">Services</a>
        <a href="upload.html" class="nav-item" id="nav-upload">Data Upload</a>
        <a href="settings.html" class="nav-item" id="nav-settings">Settings</a>
    </nav>
    <div class="mt-auto">
        <button onclick="logout()" class="nav-item" style="width: 100%; border: none; background: transparent; cursor: pointer;">
            Logout
        </button>
    </div>
</div>
`;

function initSidebar(activeId) {
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    const activeItem = document.getElementById(`nav-${activeId}`);
    if (activeItem) activeItem.classList.add('active');
    
    // Auth Check
    if (!localStorage.getItem('token') && !window.location.pathname.endsWith('index.html')) {
        window.location.href = '../index.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}
