import { DataStore } from './data-store/DataStore.js';
import { NotesModule } from './notes/NotesModule.js';
import './search/SearchInput.js';
import './tags/TagFilter.js';

const dataStore = new DataStore();

document.addEventListener('DOMContentLoaded', () => {
  const notesModuleContainer = document.querySelector('.notes-area');
  if (notesModuleContainer) {
    new NotesModule(notesModuleContainer, dataStore);
  } else {
    console.error('Notes module container not found.');
  }
});

console.log("App initialized.");
