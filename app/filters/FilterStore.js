
class FilterStore {
    constructor() {
        this.searchQuery = '';
        this.activeTagFilters = [];
        this.subscribers = new Set();
    }

    getFilters() {
        return {
            searchQuery: this.searchQuery,
            activeTagFilters: [...this.activeTagFilters]
        };
    }

    setSearchQuery(query) {
        if (this.searchQuery !== query) {
            this.searchQuery = query;
            this.notifySubscribers();
        }
    }

    addTagFilter(tag) {
        if (!this.activeTagFilters.includes(tag)) {
            this.activeTagFilters.push(tag);
            this.notifySubscribers();
        }
    }

    removeTagFilter(tag) {
        const index = this.activeTagFilters.indexOf(tag);
        if (index > -1) {
            this.activeTagFilters.splice(index, 1);
            this.notifySubscribers();
        }
    }

    clearTagFilters() {
        if (this.activeTagFilters.length > 0) {
            this.activeTagFilters = [];
            this.notifySubscribers();
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback); // Unsubscribe function
    }

    notifySubscribers() {
        const currentFilters = this.getFilters();
        this.subscribers.forEach(callback => callback(currentFilters));
    }
}

export const filterStore = new FilterStore();
