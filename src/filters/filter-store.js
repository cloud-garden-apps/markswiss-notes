
class FilterStoreModule {
    constructor() {
        this.searchQuery = '';
        this.activeTags = new Set();
        this.subscribers = [];
    }

    _notifySubscribers() {
        this.subscribers.forEach(callback => callback());
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    setSearchQuery(query) {
        if (this.searchQuery !== query) {
            this.searchQuery = query;
            this._notifySubscribers();
        }
    }

    addTagFilter(tag) {
        if (!this.activeTags.has(tag)) {
            this.activeTags.add(tag);
            this._notifySubscribers();
        }
    }

    removeTagFilter(tag) {
        if (this.activeTags.has(tag)) {
            this.activeTags.delete(tag);
            this._notifySubscribers();
        }
    }

    getSearchQuery() {
        return this.searchQuery;
    }

    getTags() {
        return Array.from(this.activeTags);
    }
}

export const FilterStore = new FilterStoreModule();
