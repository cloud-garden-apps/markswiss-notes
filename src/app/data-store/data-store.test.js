import { DataStore } from './data-store.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function test(name, fn) {
    try {
        // Clear data before each test
        DataStore._clearAllData();
        fn();
        console.log(`✅ ${name}`);
    } catch (error) {
        console.error(`❌ ${name}\n`, error);
    }
}

console.log('Running DataStore tests...');

test('should initialize with empty notes and tags', () => {
    assert(DataStore.getNotes().length === 0, 'Notes should be empty on initialization');
    assert(DataStore.getTags().length === 0, 'Tags should be empty on initialization');
});

test('should save and retrieve a new note', () => {
    const newNote = DataStore.saveNote({ title: 'Test Note', content: 'This is a test.' });
    assert(newNote.id !== undefined, 'Note should have an ID');
    assert(newNote.createdAt !== undefined, 'Note should have a createdAt timestamp');
    assert(DataStore.getNotes().length === 1, 'Should have one note');
    assert(DataStore.getNoteById(newNote.id).title === 'Test Note', 'Retrieved note title should match');
});

test('should update an existing note', () => {
    const note = DataStore.saveNote({ title: 'Old Title', content: 'Old content.' });
    const updatedNote = DataStore.saveNote({ id: note.id, title: 'New Title', content: 'New content.' });
    assert(updatedNote.title === 'New Title', 'Note title should be updated');
    assert(updatedNote.updatedAt !== undefined, 'Note should have an updatedAt timestamp');
    assert(DataStore.getNotes().length === 1, 'Still should have one note');
    assert(DataStore.getNoteById(note.id).content === 'New content.', 'Retrieved note content should be updated');
});

test('should delete a note', () => {
    const note1 = DataStore.saveNote({ title: 'Note 1' });
    const note2 = DataStore.saveNote({ title: 'Note 2' });
    assert(DataStore.getNotes().length === 2, 'Should have two notes initially');

    const deleted = DataStore.deleteNote(note1.id);
    assert(deleted === true, 'Deletion should report success');
    assert(DataStore.getNotes().length === 1, 'Should have one note after deletion');
    assert(DataStore.getNoteById(note1.id) === undefined, 'Deleted note should not be retrievable');
    assert(DataStore.getNoteById(note2.id) !== undefined, 'Other note should still exist');
});

test('should save and retrieve a new tag', () => {
    const newTag = DataStore.saveTag({ name: 'Important' });
    assert(newTag.id !== undefined, 'Tag should have an ID');
    assert(DataStore.getTags().length === 1, 'Should have one tag');
    assert(DataStore.getTagById(newTag.id).name === 'Important', 'Retrieved tag name should match');
});

test('should update an existing tag', () => {
    const tag = DataStore.saveTag({ name: 'Old Tag Name' });
    const updatedTag = DataStore.saveTag({ id: tag.id, name: 'New Tag Name' });
    assert(updatedTag.name === 'New Tag Name', 'Tag name should be updated');
    assert(DataStore.getTags().length === 1, 'Still should have one tag');
});

test('should delete a tag and remove it from notes', () => {
    const tag1 = DataStore.saveTag({ name: 'Tag 1' });
    const tag2 = DataStore.saveTag({ name: 'Tag 2' });
    const noteWithTags = DataStore.saveNote({ title: 'Note with Tags', content: '...', tags: [tag1.id, tag2.id] });

    assert(DataStore.getTags().length === 2, 'Should have two tags initially');
    assert(DataStore.getNoteById(noteWithTags.id).tags.includes(tag1.id), 'Note should have tag1 initially');

    DataStore.deleteTag(tag1.id);

    assert(DataStore.getTags().length === 1, 'Should have one tag after deletion');
    assert(DataStore.getTagById(tag1.id) === undefined, 'Deleted tag should not be retrievable');
    assert(!DataStore.getNoteById(noteWithTags.id).tags.includes(tag1.id), 'Deleted tag should be removed from notes');
    assert(DataStore.getNoteById(noteWithTags.id).tags.includes(tag2.id), 'Other tag should still be on note');
});

test('data should persist across reloads (simulated)', () => {
    DataStore._clearAllData(); // Ensure fresh start
    DataStore.saveNote({ title: 'Persistent Note' });
    DataStore.saveTag({ name: 'Persistent Tag' });

    // Simulate a module reload by re-initializing (in a real browser, this would be a page refresh)
    // For this test, we'll directly interact with localStorage to verify persistence
    const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)); // Access the key directly
    assert(storedData.notes.length === 1, 'Stored data should contain 1 note');
    assert(storedData.tags.length === 1, 'Stored data should contain 1 tag');
    assert(storedData.notes[0].title === 'Persistent Note', 'Stored note title should match');
});

console.log('DataStore tests finished.');
