import { filterStore } from '../filters/FilterStore.js';

class TagFilter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.availableTags = ['Work', 'Personal', 'Ideas', 'Urgent', 'Study']; // Dummy tags for now
        this.unsubscribe = null;
        this.currentActiveTags = [];
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.addEventListener('click', this.handleClick.bind(this));
        this.unsubscribe = filterStore.subscribe(this.handleFilterChange.bind(this));
        this.handleFilterChange(filterStore.getFilters()); // Initialize state
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    handleClick(event) {
        const tagElement = event.target.closest('.tag');
        if (tagElement) {
            const tag = tagElement.dataset.tag;
            if (this.currentActiveTags.includes(tag)) {
                filterStore.removeTagFilter(tag);
            } else {
                filterStore.addTagFilter(tag);
            }
        }
    }

    handleFilterChange(filters) {
        this.currentActiveTags = filters.activeTagFilters;
        this.updateTagDisplay();
    }

    updateTagDisplay() {
        this.shadowRoot.querySelectorAll('.tag').forEach(tagElement => {
            const tag = tagElement.dataset.tag;
            if (this.currentActiveTags.includes(tag)) {
                tagElement.classList.add('active');
            } else {
                tagElement.classList.remove('active');
            }
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .tag-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-sm);
                }
                .tag {
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border: 1px solid var(--color-border);
                    border-radius: 4px;
                    cursor: pointer;
                    background-color: var(--color-surface);
                    color: var(--color-text);
                    font-family: var(--font-family-sans);
                    font-size: 0.875em; /* Slightly smaller than base */
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .tag:hover {
                    background-color: var(--color-background);
                    border-color: var(--color-secondary);
                }
                .tag.active {
                    background-color: var(--color-accent);
                    color: var(--color-surface);
                    border-color: var(--color-accent);
                }
                .tag.active:hover {
                    background-color: var(--color-primary);
                    border-color: var(--color-primary);
                }
            </style>
            <div class="tag-container">
                ${this.availableTags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
            </div>
        `;
    }
}

customElements.define('tag-filter', TagFilter);
