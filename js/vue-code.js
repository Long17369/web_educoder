const { createApp } = Vue;

// Utility functions
function readInfo(info) {
    const dict = {};
    for (const i in info) {
        const element = info[i];
        const key = element.split("=")[0];
        const value = element.split("=")[1];
        dict[key] = value;
    }
    return dict;
}

// Marked renderer setup
if (typeof marked !== 'undefined') {
    const renderer = new marked.Renderer();
    marked.setOptions({
        renderer: renderer,
        gfm: true,
        pedantic: false,
        sanitize: false,
        tables: true,
        breaks: false,
        smartLists: true,
        smartypants: false,
    });
}

async function loadMdData(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading markdown:', error);
        return null;
    }
}

function highlightCode(element) {
    // Check if hljs is available
    if (typeof hljs === 'undefined') {
        console.warn('highlight.js is not loaded, skipping syntax highlighting');
        return;
    }
    
    element.querySelectorAll("pre code").forEach(function(code) {
        hljs.highlightElement(code);
        if (typeof hljs.lineNumbersBlock === 'function') {
            hljs.lineNumbersBlock(code);
        }
    });
}

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
const app = createApp({
    components: {
        'app-header': AppHeader,
        'app-footer': AppFooter
    },
    data() {
        return {
            pageTitle: '',
            codeContent: '',
            problemContent: '',
            info: {}
        };
    },
    methods: {
        goBack() {
            window.history.back();
        },
        async loadPage() {
            const urlParams = decodeURI(location.href).split('?');
            if (urlParams.length === 1) {
                location.href = ".";
                return;
            }
            
            this.info = readInfo(urlParams[1].split('&'));
            
            if (this.info.type === undefined || 
                this.info.problems === undefined || 
                this.info.problem === undefined) {
                location.href = ".";
                return;
            }

            this.pageTitle = this.info.title || '';
            document.title = this.info.title || 'educoder code page';
            
            // Update header manually
            const headerH1 = document.querySelector('header h1');
            if (headerH1) headerH1.textContent = this.info.title || '';

            await this.loadCode();
        },
        async loadCode() {
            const path = `${this.info.type}/${this.info.problems}/code/${this.info.problem}`;
            
            // Check if marked is available
            if (typeof marked === 'undefined') {
                console.error('marked.js is not loaded');
                return;
            }
            
            const renderer = new marked.Renderer();
            
            // Load problem content
            const problemData = await loadMdData(`${path}.cont.md`);
            if (problemData) {
                const processedData = problemData.replace('$$\\le$$', '≤').replace('$$<$$', '<');
                const htmlContent = marked.marked(processedData, renderer);
                this.problemContent = htmlContent;
                
                // Manually update the DOM
                this.$nextTick(() => {
                    const proElement = document.getElementById('pro');
                    if (proElement) {
                        proElement.innerHTML = htmlContent;
                        highlightCode(proElement);
                    }
                });
            }

            // Load code content
            const codeData = await loadMdData(`${path}.code.md`);
            if (codeData) {
                const htmlContent = marked.marked(codeData, renderer);
                this.codeContent = htmlContent;
                
                // Manually update the DOM
                this.$nextTick(() => {
                    const codeElement = document.getElementById('code');
                    if (codeElement) {
                        codeElement.innerHTML = htmlContent;
                        highlightCode(codeElement);
                    }
                });
            }
        }
    },
    mounted() {
        this.loadPage();
    }
});

app.mount('#app');
