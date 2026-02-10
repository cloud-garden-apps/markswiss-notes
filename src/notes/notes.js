
import { DataStore } from '../data-store/data-store.js';
import { FilterStore } from '../filters/filter-store.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';

class NotesModule {
    constructor() {
        this.notes = [];
        this.selectedNoteId = null;
        this.markdownContent = '';
        this.editorElement = null;
        this.previewElement = null;
        this.noteListElement = null;
        this.debounceTimer = null;
    }

    init(parentElement) {
        this.renderUI(parentElement);
        this.loadNotes();
        FilterStore.subscribe(() => this.loadNotes());
        DataStore.subscribe(() => this.loadNotes());
    }

    renderUI(parentElement) {
        parentElement.innerHTML = `
            <div class="notes-container">
                <div class="note-list">
                    <button class="new-note-button">New Note</button>
                    <div class="notes-items-container"></div>
                </div>
                <div class="note-editor">
                    <textarea class="markdown-input"></textarea>
                    <div class="markdown-preview"></div>
                </div>
            </div>
        `;

        this.noteListElement = parentElement.querySelector('.note-list');
        this.newNoteButton = parentElement.querySelector('.new-note-button');
        this.notesItemsContainer = parentElement.querySelector('.notes-items-container');
        this.editorElement = parentElement.querySelector('.markdown-input');
        this.previewElement = parentElement.querySelector('.markdown-preview');

        this.newNoteButton.addEventListener('click', () => this.createNote());
        this.editorElement.addEventListener('input', (e) => this.handleEditorInput(e));
    }

    async loadNotes() {
        const query = FilterStore.getSearchQuery().toLowerCase();
        const activeTags = FilterStore.getTags(); // activeTags is a Set
        let allNotes = await DataStore.getNotes();

        this.notes = allNotes.filter(note => {
            const matchesQuery = query === '' || 
                (note.title && note.title.toLowerCase().includes(query)) ||
                (note.content && note.content.toLowerCase().includes(query));

            // Ensure note.tags is an array before calling .includes
            const noteTags = note.tags || []; 
            const matchesTags = activeTags.size === 0 || 
                Array.from(activeTags).every(tag => noteTags.includes(tag));

            return matchesQuery && matchesTags;
        });

        this.renderNoteList();

        // Simplified selection logic
        if (this.selectedNoteId && this.notes.some(n => n.id === this.selectedNoteId)) {
            // If previously selected note is still in the filtered list, re-select it
            this.selectNote(this.selectedNoteId);
        } else if (this.notes.length > 0) {
            // Otherwise, if there are notes in the filtered list, select the first one
            this.selectNote(this.notes[0].id);
        } else {
            // If no notes are available, clear editor and deselect
            this.selectedNoteId = null;
            this.markdownContent = '';
            this.editorElement.value = '';
            this.updatePreview();
        }
    }

    renderNoteList() {
        if (!this.notesItemsContainer) return;

        this.notesItemsContainer.innerHTML = ''; // Clear only the notes container

        if (this.notes.length === 0) {
            this.notesItemsContainer.innerHTML = '<p class="no-notes-message">No notes found. Create a new one!</p>';
        } else {
            this.notesItemsContainer.innerHTML = this.notes.map(note => `
                <div class="note-list-item ${note.id === this.selectedNoteId ? 'selected' : ''}" data-id="${note.id}">
                    <h3>${note.title || 'New Note'}</h3>
                    <p>${note.content ? note.content.substring(0, 50).replace(/\n/g, ' ') + '...' : 'No content'}</p>
                    <button class="delete-note-button" data-id="${note.id}">Delete</button>
                </div>
            `).join('');
        }
        
        this.notesItemsContainer.querySelectorAll('.note-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-note-button')) {
                    this.selectNote(e.currentTarget.dataset.id);
                }
            });
        });

        this.notesItemsContainer.querySelectorAll('.delete-note-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); 
                this.deleteNote(e.currentTarget.dataset.id);
            });
        });
    }

    async createNote() {
        const newNote = {
            title: 'New Note',
            content: '# New Note\n\nStart writing your note here...',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const createdNote = await DataStore.createNote(newNote);
        // DataStore handles adding, so we just need to reload from data store
        await this.loadNotes(); 
        this.selectNote(createdNote.id);
    }

    async selectNote(id) {
        this.selectedNoteId = id;
        // Fetch the note directly from DataStore for consistency
        const note = await DataStore.getNote(id); 
        if (note) {
            this.markdownContent = note.content;
            this.editorElement.value = this.markdownContent;
            this.updatePreview();
        } else {
            // If the note doesn't exist (e.g., deleted by another client/process), clear editor
            this.selectedNoteId = null;
            this.markdownContent = '';
            this.editorElement.value = '';
            this.updatePreview();
        }
        this.renderNoteList(); 
    }

    handleEditorInput(e) {
        this.markdownContent = e.target.value;
        this.updatePreview();
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.updateNoteContent(this.selectedNoteId, this.markdownContent);
        }, 500); 
    }

    async updateNoteContent(id, content) {
        if (!id) return;
        const note = await DataStore.getNote(id);
        if (note) {
            note.content = content;
            note.updatedAt = new Date().toISOString();
            // Also update title if the first line changes
            const lines = content.split('\n');
            note.title = lines[0].replace(/^[#\s]*/, '') || 'New Note';
            await DataStore.updateNote(note);
            // After updating, reload notes to ensure list reflects changes (especially title)
            await this.loadNotes();
        }
    }

    async deleteNote(id) {
        if (!id) return;
        await DataStore.deleteNote(id);
        // After deleting, reload notes which will handle re-selection or clearing
        await this.loadNotes();
    }

    updatePreview() {
        if (this.previewElement) {
            this.previewElement.innerHTML = marked.parse(this.markdownContent);
        }
    }
}

export const Notes = new NotesModule();
