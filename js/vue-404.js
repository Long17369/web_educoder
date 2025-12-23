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
    methods: {
        goBack() {
            window.history.back();
        }
    }
}).mount('#app');
