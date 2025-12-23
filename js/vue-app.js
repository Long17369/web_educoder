const { createApp } = Vue;

// Header component
const AppHeader = {
    props: ['title'],
    template: `
        <header>
            <h1>{{ title }}</h1>
            <nav>
                <ul>
                    <li><a href=".">首页</a></li>
                </ul>
            </nav>
        </header>
    `
};

// Footer component
const AppFooter = {
    template: `
        <footer>
            <p>&copy; 2025 My Web Page</p>
        </footer>
    `
};

// Main app
createApp({
    components: {
        'app-header': AppHeader,
        'app-footer': AppFooter
    },
    data() {
        return {
            menuItems: [
                { id: 'educoder', label: '头歌', type: '头歌' },
                { id: 'pta', label: 'PTA', type: 'pta' }
            ]
        };
    },
    methods: {
        gotoPage(type) {
            const pageUrl = `./content.html?type=${type}`;
            window.location.href = pageUrl;
        }
    }
}).mount('#app');
