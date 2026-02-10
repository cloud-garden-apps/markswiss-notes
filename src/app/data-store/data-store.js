
const LOCAL_STORAGE_KEY = 'swiss_notes_app_data';

let data = {
    notes: [],
    tags: []
};

function _save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function _load() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
        data = JSON.parse(storedData);
    }
}

function _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Initialize data from localStorage on module load
_load();

export const DataStore = {
    getNotes() {
        return [...data.notes]; // Return a copy to prevent direct mutation
    },

    getNoteById(id) {
        return data.notes.find(note => note.id === id);
    },

    saveNote(note) {
        if (!note.id) {
            note.id = _generateId();
            note.createdAt = new Date().toISOString();
            data.notes.push(note);
        } else {
            const index = data.notes.findIndex(n => n.id === note.id);
            if (index !== -1) {
                note.updatedAt = new Date().toISOString();
                data.notes[index] = { ...data.notes[index], ...note }; // Merge existing with new
            } else {
                // If note has an ID but is not found, treat as new
                note.createdAt = new Date().toISOString();
                data.notes.push(note);
            }
        }
        _save();
        return note;
    },

    deleteNote(id) {
        const initialLength = data.notes.length;
        data.notes = data.notes.filter(note => note.id !== id);
        _save();
        return data.notes.length < initialLength; // True if a note was deleted
    },

    getTags() {
        return [...data.tags];
    },

    getTagById(id) {
        return data.tags.find(tag => tag.id === id);
    },

    saveTag(tag) {
        if (!tag.id) {
            tag.id = _generateId();
            data.tags.push(tag);
        } else {
            const index = data.tags.findIndex(t => t.id === tag.id);
            if (index !== -1) {
                data.tags[index] = { ...data.tags[index], ...tag };
            } else {
                data.tags.push(tag); // If tag has an ID but not found, treat as new
            }
        }
        _save();
        return tag;
    },

    deleteTag(id) {
        const initialLength = data.tags.length;
        data.tags = data.tags.filter(tag => tag.id !== id);
        // Also remove this tag from any notes that might have it
        data.notes.forEach(note => {
            if (note.tags) {
                note.tags = note.tags.filter(tagId => tagId !== id);
            }
        });
        _save();
        return data.tags.length < initialLength;
    },

    _clearAllData() { // For testing purposes
        data = { notes: [], tags: [] };
        _save();
    }
};
