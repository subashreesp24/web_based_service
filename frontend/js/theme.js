const theme = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.set(savedTheme);
    },
    set(name) {
        document.documentElement.setAttribute('data-theme', name);
        localStorage.setItem('theme', name);
    },
    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        this.set(current === 'dark' ? 'light' : 'dark');
    }
};

document.addEventListener('DOMContentLoaded', () => theme.init());
