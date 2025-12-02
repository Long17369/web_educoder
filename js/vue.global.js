// Minimal Vue.js-like implementation for this project
(function(global) {
    'use strict';

    // Simple reactive system
    function reactive(obj, updateCallback) {
        return new Proxy(obj, {
            set(target, key, value) {
                target[key] = value;
                if (updateCallback) {
                    updateCallback(key, value);
                }
                return true;
            }
        });
    }

    // Component class
    class Component {
        constructor(options) {
            this.options = options;
            this.data = options.data ? options.data() : {};
            this.methods = options.methods || {};
            this.components = options.components || {};
            this.template = options.template || '';
            this.props = options.props || [];
        }

        render(el, props = {}) {
            if (this.template) {
                el.innerHTML = this.processTemplate(this.template, props);
            }
        }

        processTemplate(template, props) {
            let processed = template;
            // Replace {{ prop }} with actual values
            Object.keys(props).forEach(key => {
                const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                processed = processed.replace(regex, props[key]);
            });
            return processed;
        }
    }

    // App class
    class App {
        constructor(options) {
            this.options = options;
            this.methods = options.methods || {};
            this.components = options.components || {};
            this.mounted = options.mounted;
            this.el = null;
            this._componentBindings = null;
            
            // Create reactive data with update callback
            this.data = reactive(
                options.data ? options.data() : {}, 
                (key, value) => this.updateComponents()
            );
        }

        mount(selector) {
            this.el = document.querySelector(selector);
            if (!this.el) {
                console.error(`Cannot find element: ${selector}`);
                return;
            }

            // Initialize components
            this.initComponents();

            // Bind methods to Vue instance
            Object.keys(this.methods).forEach(key => {
                this[key] = this.methods[key].bind(this);
            });

            // Set up event listeners
            this.setupEventListeners();

            // Render initial data
            this.render();

            // Call mounted lifecycle hook
            if (this.mounted) {
                this.mounted.call(this);
            }

            return this;
        }

        initComponents() {
            Object.keys(this.components).forEach(tagName => {
                const ComponentDef = this.components[tagName];
                const componentEls = this.el.querySelectorAll(tagName);
                
                componentEls.forEach(componentEl => {
                    const component = new Component(ComponentDef);
                    const props = {};
                    
                    // Get props from attributes and store references for updates
                    Array.from(componentEl.attributes).forEach(attr => {
                        if (attr.name.startsWith(':')) {
                            const propName = attr.name.substring(1);
                            const dataKey = attr.value;
                            props[propName] = this.data[dataKey] || attr.value;
                            
                            // Store reference for reactive updates
                            if (!this._componentBindings) {
                                this._componentBindings = [];
                            }
                            this._componentBindings.push({
                                element: componentEl,
                                component: component,
                                propName: propName,
                                dataKey: dataKey
                            });
                        } else {
                            props[attr.name] = attr.value;
                        }
                    });
                    
                    component.render(componentEl, props);
                });
            });
        }

        updateComponents() {
            if (!this._componentBindings) return;
            
            this._componentBindings.forEach(binding => {
                const props = {};
                Array.from(binding.element.attributes).forEach(attr => {
                    if (attr.name.startsWith(':')) {
                        const propName = attr.name.substring(1);
                        props[propName] = this.data[attr.value] || attr.value;
                    } else {
                        props[attr.name] = attr.value;
                    }
                });
                binding.component.render(binding.element, props);
            });
        }

        setupEventListeners() {
            // Handle @click events on regular elements
            this.el.querySelectorAll('[\\@click]').forEach(el => {
                const handler = el.getAttribute('@click');
                
                // Check if it's a method call with parameters
                const methodMatch = handler.match(/(\w+)\(([^)]*)\)/);
                if (methodMatch) {
                    const methodName = methodMatch[1];
                    const paramValue = methodMatch[2].replace(/['"]/g, '');
                    if (this.methods[methodName]) {
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.methods[methodName](paramValue);
                        });
                    }
                } else if (this.methods[handler]) {
                    el.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.methods[handler](e);
                    });
                }
            });

            // Handle v-for lists
            this.renderLists();
        }

        renderLists() {
            const vForElements = this.el.querySelectorAll('[v-for]');
            vForElements.forEach(el => {
                const vForValue = el.getAttribute('v-for');
                const match = vForValue.match(/(\w+)\s+in\s+(\w+)/);
                
                if (match) {
                    const itemName = match[1];
                    const arrayName = match[2];
                    const array = this.data[arrayName];
                    
                    if (Array.isArray(array)) {
                        const parent = el.parentElement;
                        const template = el.cloneNode(true);
                        template.removeAttribute('v-for');
                        template.removeAttribute(':key');
                        el.remove();
                        
                        array.forEach(item => {
                            const clone = template.cloneNode(true);
                            
                            // Replace template variables in text content
                            this.processNode(clone, itemName, item);
                            
                            // Handle @click with item
                            const clickableElements = clone.querySelectorAll('[\\@click]');
                            clickableElements.forEach(clickEl => {
                                const clickAttr = clickEl.getAttribute('@click');
                                const methodMatch = clickAttr.match(/(\w+)\(([^)]+)\)/);
                                if (methodMatch) {
                                    const methodName = methodMatch[1];
                                    const paramName = methodMatch[2];
                                    
                                    // If parameter references the item variable
                                    if (paramName.startsWith(itemName)) {
                                        const propMatch = paramName.match(/\w+\.(\w+)/);
                                        const paramValue = propMatch ? item[propMatch[1]] : item;
                                        clickEl.addEventListener('click', (e) => {
                                            e.preventDefault();
                                            this.methods[methodName](paramValue);
                                        });
                                    } else {
                                        clickEl.addEventListener('click', (e) => {
                                            e.preventDefault();
                                            this.methods[methodName](item);
                                        });
                                    }
                                }
                            });
                            
                            parent.appendChild(clone);
                        });
                    }
                }
            });
        }

        processNode(node, itemName, item) {
            // Process text nodes
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const regex = new RegExp(`{{\\s*${itemName}\\.(\\w+)\\s*}}`, 'g');
                node.textContent = text.replace(regex, (match, prop) => item[prop] || '');
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Process attributes
                Array.from(node.attributes).forEach(attr => {
                    if (attr.name.startsWith(':')) {
                        const propName = attr.name.substring(1);
                        const attrValue = attr.value;
                        const match = attrValue.match(new RegExp(`${itemName}\\.(\\w+)`));
                        if (match) {
                            node.setAttribute(propName, item[match[1]] || '');
                            node.removeAttribute(attr.name);
                        }
                    }
                });
                
                // Process child nodes
                Array.from(node.childNodes).forEach(child => {
                    this.processNode(child, itemName, item);
                });
            }
        }

        render() {
            // Update components
            this.updateComponents();
            
            // Re-render lists
            const listContainer = this.el.querySelector('main ul');
            if (listContainer && this.data.items && Array.isArray(this.data.items)) {
                // Clear existing items first (except template)
                const existingItems = listContainer.querySelectorAll('li:not([v-for])');
                existingItems.forEach(item => item.remove());
                
                // Now render new items if needed
                this.renderLists();
            }
        }

        $nextTick(callback) {
            setTimeout(callback, 0);
        }
    }

    // Create app function
    function createApp(options) {
        return new App(options);
    }

    // Export to global
    global.Vue = {
        createApp: createApp
    };

})(window);
