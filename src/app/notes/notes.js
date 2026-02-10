import { DataStore } from '../data-store/data-store.js';
import { FilterStore } from '../filters/filter-store.js';
import { MarkdownRenderer } from '../markdown-renderer/markdown-renderer.js';

const ID_PREFIX = 'note-';
const NOTE_LIST_CONTAINER_ID = 'notes-list';
const NOTE_EDITOR_ID = 'note-editor';
const NOTE_PREVIEW_ID = 'note-preview';
const NEW_NOTE_BUTTON_ID = 'new-note-button';
const DELETE_NOTE_BUTTON_ID = 'delete-note-button';

export class NotesController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`NotesController: Container with ID "${containerId}" not found.`);
            return;
        }

        this.selectedNoteId = null;
        this.renderInitialLayout();
        this.elements = this.getDOMElements();
        this.attachEventListeners();
        this.loadAndDisplayNotes();

        // Subscribe to filter changes
        FilterStore.subscribe(() => this.filterAndRenderNotes());
    }

    renderInitialLayout() {
        this.container.innerHTML = `
            <div class="notes-layout">
                <div class="notes-sidebar">
                    <div class="notes-actions">
                        <button id="${NEW_NOTE_BUTTON_ID}" class="swiss-button">New Note</button>
                        <button id="${DELETE_NOTE_BUTTON_ID}" class="swiss-button delete-button" disabled>Delete</button>
                    </div>
                    <ul id="${NOTE_LIST_CONTAINER_ID}" class="notes-list">
                        <!-- Notes will be rendered here -->
                    </ul>
                </div>
                <div class="note-content-area">
                    <textarea id="${NOTE_EDITOR_ID}" class="note-editor" placeholder="Start writing your note..." disabled></textarea>
                    <div id="${NOTE_PREVIEW_ID}" class="note-preview markdown-body">
                        <!-- Markdown preview will appear here -->
                    </div>
                </div>
            </div>
        `;
    }

    getDOMElements() {
        return {
            noteList: this.container.querySelector(`#${NOTE_LIST_CONTAINER_ID}`),
            noteEditor: this.container.querySelector(`#${NOTE_EDITOR_ID}`),
            notePreview: this.container.querySelector(`#${NOTE_PREVIEW_ID}`),
            newNoteButton: this.container.querySelector(`#${NEW_NOTE_BUTTON_ID}`),
            deleteNoteButton: this.container.querySelector(`#${DELETE_NOTE_BUTTON_ID}`)
        };
    }

    attachEventListeners() {
        this.elements.noteList.addEventListener('click', this._handleNoteSelected.bind(this));
        this.elements.noteEditor.addEventListener('input', this._handleEditorInput.bind(this));
        this.elements.newNoteButton.addEventListener('click', this._handleNewNote.bind(this));
        this.elements.deleteNoteButton.addEventListener('click', this._handleDeleteNote.bind(this));
    }

    loadAndDisplayNotes() {
        this.filterAndRenderNotes();
        // Optionally select the first note or previously selected note
        const allNotes = DataStore.getAllNotes();
        if (allNotes.length > 0) {
            this.selectNote(allNotes[0].id);
        }
    }

    filterAndRenderNotes() {
        const { searchQuery, tagIds } = FilterStore.getCurrentFilters();
        const allNotes = DataStore.getAllNotes();
        const filteredNotes = allNotes.filter(note => {
            const matchesSearch = searchQuery === '' || note.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTags = tagIds.length === 0 || tagIds.every(tagId => note.tagIds && note.tagIds.includes(tagId));
            return matchesSearch && matchesTags;
        });
        this._renderNotesList(filteredNotes);
        // If the currently selected note is no longer in the filtered list, deselect it
        if (this.selectedNoteId && !filteredNotes.some(note => note.id === this.selectedNoteId)) {
            this.deselectNote();
        } else if (this.selectedNoteId) {
            // Re-highlight if still selected
            this.highlightSelectedNote();
        }
    }

    _renderNotesList(notes) {
        this.elements.noteList.innerHTML = '';
        if (notes.length === 0) {
            this.elements.noteList.innerHTML = '<li class="notes-list-empty">No notes found.</li>';
            return;
        }

        const fragment = document.createDocumentFragment();
        notes.forEach(note => {
            const noteElement = document.createElement('li');
            noteElement.id = `${ID_PREFIX}${note.id}`;
            noteElement.className = 'notes-list-item';
            noteElement.dataset.noteId = note.id;

            const firstLine = note.content.split('\n')[0].substring(0, 50) || 'New Note';
            const displayContent = firstLine.length < note.content.split('\n')[0].length ? `${firstLine}...` : firstLine;
            noteElement.textContent = displayContent;
            fragment.appendChild(noteElement);
        });
        this.elements.noteList.appendChild(fragment);
        this.highlightSelectedNote();
    }

    _handleNoteSelected(event) {
        const listItem = event.target.closest('.notes-list-item');
        if (listItem && listItem.dataset.noteId) {
            const noteId = listItem.dataset.noteId;
            this.selectNote(noteId);
        }
    }

    selectNote(noteId) {
        this.selectedNoteId = noteId;
        const note = DataStore.getNote(noteId);
        if (note) {
            this.elements.noteEditor.value = note.content;
            this.elements.noteEditor.disabled = false;
            this.elements.deleteNoteButton.disabled = false;
            this._updatePreview(note.content);
            this.highlightSelectedNote();
        }
    }

    deselectNote() {
        this.selectedNoteId = null;
        this.elements.noteEditor.value = '';
        this.elements.noteEditor.disabled = true;
        this.elements.deleteNoteButton.disabled = true;
        this.elements.notePreview.innerHTML = '';
        this.highlightSelectedNote(); // To remove any existing highlights
    }

    highlightSelectedNote() {
        this.elements.noteList.querySelectorAll('.notes-list-item').forEach(item => {
            item.classList.remove('selected');
        });
        if (this.selectedNoteId) {
            const selectedElement = this.elements.noteList.querySelector(`[data-note-id="${this.selectedNoteId}"]`);
            if (selectedElement) {
                selectedElement.classList.add('selected');
            }
        }
    }

    _handleEditorInput() {
        if (this.selectedNoteId) {
            const newContent = this.elements.noteEditor.value;
            DataStore.updateNote(this.selectedNoteId, newContent);
            this._updatePreview(newContent);
            // Update the display text in the notes list
            const selectedElement = this.elements.noteList.querySelector(`[data-note-id="${this.selectedNoteId}"]`);
            if (selectedElement) {
                const firstLine = newContent.split('\n')[0].substring(0, 50) || 'New Note';
                const displayContent = firstLine.length < newContent.split('\n')[0].length ? `${firstLine}...` : firstLine;
                selectedElement.textContent = displayContent;
            }
        }
    }

    _handleNewNote() {
        const newNote = DataStore.createNote('');
        this.filterAndRenderNotes(); // Re-render to include the new note
        this.selectNote(newNote.id);
        this.elements.noteEditor.focus();
    }

    _handleDeleteNote() {
        if (this.selectedNoteId && confirm('Are you sure you want to delete this note?')) {
            DataStore.deleteNote(this.selectedNoteId);
            this.deselectNote();
            this.filterAndRenderNotes(); // Re-render to remove the deleted note
        }
    }

    _updatePreview(content) {
        this.elements.notePreview.innerHTML = MarkdownRenderer.render(content);
    }
}


export class NotesController {
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.selectedNoteId = null;
        this.notes = []; // Array to hold filtered notes
        this.init();
    }

    init() {
        this._renderBaseLayout();
        this._bindEventListeners();
        FilterStore.subscribe(() => this._updateNoteListAndSelection());
        DataStore.subscribe(() => this._updateNoteListAndSelection());
        this._updateNoteListAndSelection();
    }

    _renderBaseLayout() {
        this.containerElement.innerHTML = `
            <div class="notes-layout">
                <div class="notes-list-panel">
                    <div class="notes-list-header">
                        <h2>Notes</h2>
                        <button class="add-note-button">+</button>
                    </div>
                    <ul class="notes-list">
                        <!-- Notes will be rendered here -->
                    </ul>
                </div>
                <div class="note-editor-panel">
                    <textarea class="note-editor" placeholder="Start writing your note in Markdown..."></textarea>
                </div>
                <div class="note-preview-panel github-markdown-body">
                    <!-- Markdown preview will be rendered here -->
                </div>
            </div>
        `;

        this.notesListElement = this.containerElement.querySelector('.notes-list');
        this.editorElement = this.containerElement.querySelector('.note-editor');
        this.previewElement = this.containerElement.querySelector('.note-preview-panel');
        this.addNoteButton = this.containerElement.querySelector('.add-note-button');
    }

    _bindEventListeners() {
        this.addNoteButton.addEventListener('click', () => this._createNewNote());
        this.notesListElement.addEventListener('click', (event) => this._handleNoteSelection(event));
        this.editorElement.addEventListener('input', () => this._handleEditorInput());
    }

    _updateNoteListAndSelection() {
        const filters = FilterStore.getFilters();
        this.notes = DataStore.getNotes(filters.searchQuery, filters.tagIds);
        this._renderNotesList();

        // If no note is selected or the selected note no longer exists, try to select the first one
        if (!this.selectedNoteId || !this.notes.some(note => note.id === this.selectedNoteId)) {
            if (this.notes.length > 0) {
                this._selectNote(this.notes[0].id);
            } else {
                this._clearEditorAndPreview();
            }
        } else {
            // Re-render current selection if it still exists and is visible
            this._selectNote(this.selectedNoteId);
        }
    }

    _renderNotesList() {
        this.notesListElement.innerHTML = '';
        if (this.notes.length === 0) {
            this.notesListElement.innerHTML = '<li class="empty-list-message">No notes found.</li>';
            return;
        }

        const fragment = document.createDocumentFragment();
        this.notes.forEach(note => {
            const li = document.createElement('li');
            li.id = ID_PREFIX + note.id;
            li.className = 'note-list-item';
            if (note.id === this.selectedNoteId) {
                li.classList.add('selected');
            }
            li.innerHTML = `
                <span class="note-title">${note.content.split('\n')[0].substring(0, 50) || 'New Note'}</span>
                <span class="note-date">${new Date(note.updatedAt).toLocaleDateString()}</span>
                <button class="delete-note-button" data-note-id="${note.id}">x</button>
            `;
            fragment.appendChild(li);
        });
        this.notesListElement.appendChild(fragment);
    }

    _handleNoteSelection(event) {
        const listItem = event.target.closest('.note-list-item');
        if (event.target.classList.contains('delete-note-button')) {
            const noteId = event.target.dataset.noteId;
            if (confirm('Are you sure you want to delete this note?')) {
                DataStore.deleteNote(noteId);
                // DataStore subscription will trigger re-rendering and selection update
            }
            return;
        }

        if (listItem) {
            const noteId = listItem.id.replace(ID_PREFIX, '');
            this._selectNote(noteId);
        }
    }

    _selectNote(noteId) {
        if (this.selectedNoteId) {
            const prevSelected = this.containerElement.querySelector(`#${ID_PREFIX}${this.selectedNoteId}`);
            if (prevSelected) {
                prevSelected.classList.remove('selected');
            }
        }

        this.selectedNoteId = noteId;
        const currentSelected = this.containerElement.querySelector(`#${ID_PREFIX}${this.selectedNoteId}`);
        if (currentSelected) {
            currentSelected.classList.add('selected');
        }

        const selectedNote = DataStore.getNoteById(noteId);
        if (selectedNote) {
            this.editorElement.value = selectedNote.content;
            this._renderPreview(selectedNote.content);
        } else {
            this._clearEditorAndPreview();
        }
    }

    _createNewNote() {
        const newNote = DataStore.addNote({
            content: '',
            tagIds: []
        });
        this._selectNote(newNote.id);
        this.editorElement.focus();
    }

    _handleEditorInput() {
        if (!this.selectedNoteId) {
            return;
        }
        const newContent = this.editorElement.value;
        DataStore.updateNote(this.selectedNoteId, { content: newContent });
        this._renderPreview(newContent);
    }

    _renderPreview(markdownContent) {
        this.previewElement.innerHTML = MarkdownRenderer.render(markdownContent);
    }

    _clearEditorAndPreview() {
        this.editorElement.value = '';
        this.previewElement.innerHTML = 'Select a note or click "+" to create a new one.';
        this.selectedNoteId = null;
    }
}
