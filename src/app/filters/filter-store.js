const LOCAL_STORAGE_FILTER_KEY = 'swiss_notes_app_filters';

let currentFilters = {
    searchQuery: '',
    tagIds: [] // Array of tag IDs
};

let subscribers = []; // Changed to `let` for easier resetting in tests

function _saveFilters() {
    localStorage.setItem(LOCAL_STORAGE_FILTER_KEY, JSON.stringify(currentFilters));
}

function _loadFilters() {
    const storedFilters = localStorage.getItem(LOCAL_STORAGE_FILTER_KEY);
    if (storedFilters) {
        currentFilters = JSON.parse(storedFilters);
    }
}

function _notifySubscribers() {
    subscribers.forEach(callback => callback(currentFilters));
}

// Load filters on module initialization
_loadFilters();

export const FilterStore = {
    subscribe(callback) {
        subscribers.push(callback);
        // Immediately notify with current state
        callback(currentFilters);
        return () => {
            // Unsubscribe function
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    },

    getFilters() {
        return { ...currentFilters }; // Return a copy
    },

    setSearchQuery(query) {
        if (currentFilters.searchQuery !== query) {
            currentFilters.searchQuery = query;
            _saveFilters();
            _notifySubscribers();
        }
    },

    addTagFilter(tagId) {
        if (!currentFilters.tagIds.includes(tagId)) {
            currentFilters.tagIds.push(tagId);
            _saveFilters();
            _notifySubscribers();
        }
    },

    removeTagFilter(tagId) {
        const initialLength = currentFilters.tagIds.length;
        currentFilters.tagIds = currentFilters.tagIds.filter(id => id !== tagId);
        if (currentFilters.tagIds.length < initialLength) {
            _saveFilters();
            _notifySubscribers();
        }
    },

    clearTagFilters() {
        if (currentFilters.tagIds.length > 0) {
            currentFilters.tagIds = [];
            _saveFilters();
            _notifySubscribers();
        }
    },

    // For testing purposes: Clears both filters and subscribers
    _clearAllFilters() {
        currentFilters = { searchQuery: '', tagIds: [] };
        subscribers = []; // Clear subscribers for testing isolation
        localStorage.removeItem(LOCAL_STORAGE_FILTER_KEY); // Also clear from local storage
        // No need to _notifySubscribers immediately after clear, as the intent is to reset for next test
    }
};
