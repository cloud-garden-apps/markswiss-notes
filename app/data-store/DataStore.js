
const NOTES_KEY = 'notes';
const TAGS_KEY = 'tags';

export class DataStore {
  constructor() {
    this.notes = this._loadFromLocalStorage(NOTES_KEY) || [];
    this.tags = this._loadFromLocalStorage(TAGS_KEY) || [];
  }

  _loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error loading ${key} from localStorage:`, e);
      return null;
    }
  }

  _saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getNotes() {
    return [...this.notes];
  }

  getNote(id) {
    return this.notes.find(note => note.id === id);
  }

  createNote(content = '', tags = []) {
    const newNote = {
      id: this._generateId(),
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.notes.push(newNote);
    this._saveToLocalStorage(NOTES_KEY, this.notes);
    return newNote;
  }

  saveNote(updatedNote) {
    const index = this.notes.findIndex(note => note.id === updatedNote.id);
    if (index > -1) {
      this.notes[index] = { ...this.notes[index], ...updatedNote, updatedAt: new Date().toISOString() };
      this._saveToLocalStorage(NOTES_KEY, this.notes);
      return this.notes[index];
    }
    return null;
  }

  deleteNote(id) {
    const initialLength = this.notes.length;
    this.notes = this.notes.filter(note => note.id !== id);
    if (this.notes.length < initialLength) {
      this._saveToLocalStorage(NOTES_KEY, this.notes);
      return true;
    }
    return false;
  }

  getTags() {
    return [...this.tags];
  }

  getTag(id) {
    return this.tags.find(tag => tag.id === id);
  }

  createTag(name) {
    const newTag = {
      id: this._generateId(),
      name,
      createdAt: new Date().toISOString(),
    };
    this.tags.push(newTag);
    this._saveToLocalStorage(TAGS_KEY, this.tags);
    return newTag;
  }

  saveTag(updatedTag) {
    const index = this.tags.findIndex(tag => tag.id === updatedTag.id);
    if (index > -1) {
      this.tags[index] = { ...this.tags[index], ...updatedTag };
      this._saveToLocalStorage(TAGS_KEY, this.tags);
      return this.tags[index];
    }
    return null;
  }

  deleteTag(id) {
    const initialLength = this.tags.length;
    this.tags = this.tags.filter(tag => tag.id !== id);
    if (this.tags.length < initialLength) {
      this._saveToLocalStorage(TAGS_KEY, this.tags);
      // Also remove this tag from all notes
      this.notes.forEach(note => {
        note.tags = note.tags.filter(tagId => tagId !== id);
      });
      this._saveToLocalStorage(NOTES_KEY, this.notes);
      return true;
    }
    return false;
  }
}
