
const NOTES_STORAGE_KEY = 'notes';

class DataStoreModule {
    constructor() {
        this.notes = this._loadNotesFromLocalStorage();
    }

    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    _loadNotesFromLocalStorage() {
        const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
        return notesJson ? JSON.parse(notesJson) : [];
    }

    _saveNotesToLocalStorage() {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(this.notes));
    }

    async createNote(note) {
        const newNote = { ...note, id: this._generateId() };
        this.notes.push(newNote);
        this._saveNotesToLocalStorage();
        return newNote;
    }

    async getNotes() {
        return [...this.notes];
    }

    async getNote(id) {
        return this.notes.find(note => note.id === id);
    }

    async updateNote(updatedNote) {
        const index = this.notes.findIndex(note => note.id === updatedNote.id);
        if (index > -1) {
            this.notes[index] = { ...this.notes[index], ...updatedNote, updatedAt: new Date().toISOString() };
            this._saveNotesToLocalStorage();
            return this.notes[index];
        }
        return null;
    }

    async deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this._saveNotesToLocalStorage();
        return true;
    }

    // TODO: Implement tag CRUD operations
}

export const DataStore = new DataStoreModule();
