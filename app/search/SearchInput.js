import { filterStore } from '../filters/FilterStore.js';

class SearchInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.inputElement = null;
        this.unsubscribe = null;
    }

    connectedCallback() {
        this.render();
        this.inputElement = this.shadowRoot.querySelector('input');
        this.inputElement.value = filterStore.getFilters().searchQuery;

        this.inputElement.addEventListener('input', this.handleInput.bind(this));
        this.unsubscribe = filterStore.subscribe(this.handleFilterChange.bind(this));
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    handleInput(event) {
        filterStore.setSearchQuery(event.target.value);
    }

    handleFilterChange(filters) {
        if (this.inputElement.value !== filters.searchQuery) {
            this.inputElement.value = filters.searchQuery;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                input {
                    width: 100%;
                    padding: var(--spacing-sm) var(--spacing-md);
                    border: 1px solid var(--color-border);
                    border-radius: 4px;
                    font-family: var(--font-family-sans);
                    font-size: var(--font-size-base);
                    color: var(--color-text);
                    background-color: var(--color-surface);
                    transition: border-color 0.2s ease;
                }
                input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }
                input::placeholder {
                    color: var(--color-text-light);
                }
            </style>
            <input type="search" placeholder="Search notes...">
        `;
    }
}

customElements.define('search-input', SearchInput);
