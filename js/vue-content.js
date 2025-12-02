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

function linkInfo(info) {
    let link = "";
    for (const i in info) {
        const element = info[i];
        link += i + "=" + element + "&";
    }
    return link.slice(0, -1);
}

async function loadJsonData(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
        return null;
    }
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
            items: [],
            info: {}
        };
    },
    methods: {
        goBack() {
            window.history.back();
        },
        navigateToItem(item) {
            const type = this.info.problems === undefined ? 'problems' : 'problem';
            const pageUrl = `./content.html?${linkInfo(this.info)}&${type}=${item.id}`;
            window.location.href = pageUrl;
        },
        async loadPage() {
            const urlParams = decodeURI(location.href).split('?');
            if (urlParams.length === 1) {
                location.href = ".";
                return;
            }
            
            this.info = readInfo(urlParams[1].split('&'));
            
            if (this.info.type === undefined) {
                location.href = ".";
                return;
            }

            if (this.info.problems === undefined) {
                this.pageTitle = this.info.type;
                document.title = this.info.type;
                
                // Update header manually
                const headerH1 = document.querySelector('header h1');
                if (headerH1) headerH1.textContent = this.info.type;
                
                await this.loadData(this.info.type, 'problems');
                return;
            }

            if (this.info.problem === undefined) {
                this.pageTitle = this.info.problems;
                document.title = this.info.problems;
                
                // Update header manually
                const headerH1 = document.querySelector('header h1');
                if (headerH1) headerH1.textContent = this.info.problems;
                
                await this.loadData(`${this.info.type}/${this.info.problems}`, 'problem');
                return;
            }

            // Navigate to code page
            location.href = `./code.html?${linkInfo(this.info)}`;
        },
        async loadData(path, type) {
            const data = await loadJsonData(`./${path}/data.json`);
            if (!data) return;

            this.items = this.handleData(data, type);
            
            // Manually trigger render after data is loaded
            this.$nextTick(() => {
                // Find the list container and render items
                const listContainer = document.querySelector('main ul');
                if (listContainer && this.items.length > 0) {
                    listContainer.innerHTML = '';
                    this.items.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item.label;
                        li.style.cursor = 'pointer';
                        li.addEventListener('click', () => {
                            this.navigateToItem(item);
                        });
                        listContainer.appendChild(li);
                    });
                }
            });
        },
        handleData(data, type) {
            const ret = [];
            if (type === "problems") {
                data.forEach(element => {
                    ret.push({ label: element, id: element });
                });
                return ret;
            }
            data.content.forEach(element => {
                ret.push({
                    label: `${element.proid}.${element.title}`,
                    id: `${element.id}&title=${element.title}`
                });
            });
            return ret;
        }
    },
    mounted() {
        this.loadPage();
    }
});

app.mount('#app');
