import { DataStore } from '../data-store/DataStore.js';
// Assuming 'marked' is available globally or will be imported if needed
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

export class NotesModule {
  constructor(containerElement, dataStore) {
    this.containerElement = containerElement;
    this.dataStore = dataStore;
    this.selectedNoteId = null;

    this.notes = this.dataStore.getNotes();
    if (this.notes.length > 0) {
      this.selectedNoteId = this.notes[0].id;
    }

    this._render();
    this._addEventListeners();
  }

  _render() {
    this.containerElement.innerHTML = `
      <div class="notes-module">
        <div class="note-list-panel">
          <button id="new-note-btn">New Note</button>
          <ul id="note-list"></ul>
        </div>
        <div class="note-editor-panel">
          <textarea id="note-editor" placeholder="Start writing your note..."></textarea>
          <button id="delete-note-btn" class="delete-btn">Delete Note</button>
        </div>
        <div class="note-preview-panel">
          <div id="note-preview"></div>
        </div>
      </div>
    `;
    this._renderNoteList();
    this._renderSelectedNote();
  }

  _renderNoteList() {
    const noteListElement = this.containerElement.querySelector('#note-list');
    noteListElement.innerHTML = ''; // Clear existing list

    this.notes.forEach(note => {
      const listItem = document.createElement('li');
      listItem.dataset.noteId = note.id;
      listItem.textContent = note.content.substring(0, 30) || 'New Note';
      if (note.id === this.selectedNoteId) {
        listItem.classList.add('selected');
      }
      noteListElement.appendChild(listItem);
    });
  }

  _renderSelectedNote() {
    const editor = this.containerElement.querySelector('#note-editor');
    const preview = this.containerElement.querySelector('#note-preview');
    const deleteBtn = this.containerElement.querySelector('#delete-note-btn');

    if (this.selectedNoteId) {
      const note = this.dataStore.getNote(this.selectedNoteId);
      if (note) {
        editor.value = note.content;
        // Assuming marked is available globally
        preview.innerHTML = marked.parse(note.content);
        editor.removeAttribute('disabled');
        deleteBtn.removeAttribute('disabled');
      }
    } else {
      editor.value = '';
      preview.innerHTML = '';
      editor.setAttribute('disabled', 'true');
      deleteBtn.setAttribute('disabled', 'true');
    }
  }

  _addEventListeners() {
    this.containerElement.querySelector('#new-note-btn').addEventListener('click', () => this._handleNewNote());
    this.containerElement.querySelector('#note-list').addEventListener('click', (event) => this._handleNoteSelect(event));
    this.containerElement.querySelector('#note-editor').addEventListener('input', (event) => this._handleNoteEdit(event));
    this.containerElement.querySelector('#delete-note-btn').addEventListener('click', () => this._handleDeleteNote());
  }

  _handleNewNote() {
    const newNote = this.dataStore.createNote();
    this.notes.push(newNote); // Update local notes array
    this.selectedNoteId = newNote.id;
    this._renderNoteList();
    this._renderSelectedNote();
  }

  _handleNoteSelect(event) {
    const listItem = event.target.closest('li');
    if (listItem && listItem.dataset.noteId) {
      this.selectedNoteId = listItem.dataset.noteId;
      this._renderNoteList(); // Re-render to update selected class
      this._renderSelectedNote();
    }
  }

  _handleNoteEdit(event) {
    if (this.selectedNoteId) {
      const updatedContent = event.target.value;
      const note = this.dataStore.getNote(this.selectedNoteId);
      if (note) {
        const updatedNote = { ...note, content: updatedContent };
        this.dataStore.saveNote(updatedNote);
        this._renderSelectedNote(); // Re-render preview
        this._renderNoteList(); // Update title in list
      }
    }
  }

  _handleDeleteNote() {
    if (this.selectedNoteId && confirm('Are you sure you want to delete this note?')) {
      this.dataStore.deleteNote(this.selectedNoteId);
      this.notes = this.dataStore.getNotes(); // Refresh local notes array
      this.selectedNoteId = this.notes.length > 0 ? this.notes[0].id : null;
      this._render(); // Re-render everything
    }
  }
}
