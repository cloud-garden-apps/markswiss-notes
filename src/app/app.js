import { DataStore } from './data-store/data-store.js';
import { FilterStore } from './filters/filter-store.js';
import { NotesController } from './notes/notes.js'; // Assuming this will be the main notes module

// Initialize DataStore and FilterStore (they handle their own loading from localStorage)
DataStore.load();
FilterStore.load();
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
        console.error('App container #app not found.');
        return;
    }

    // Create a container for the notes module within the app container
    const notesContainer = document.createElement('div');
    notesContainer.id = 'notes-container';
    appContainer.appendChild(notesContainer);

    // Instantiate NotesController
    new NotesController(notesContainer);

    // Initial render or update calls can be placed here if needed
    // e.g., to load initial data or apply initial filters
});
