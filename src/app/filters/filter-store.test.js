import { FilterStore } from './filter-store.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function test(name, fn) {
    try {
        // Clear filters and subscribers before each test
        FilterStore._clearAllFilters();
        fn();
        console.log(`✅ ${name}`);
    } catch (error) {
        console.error(`❌ ${name}\n`, error);
    }
}

console.log('Running FilterStore tests...');

test('should initialize with empty search query and tags', () => {
    const filters = FilterStore.getFilters();
    assert(filters.searchQuery === '', 'Search query should be empty');
    assert(filters.tagIds.length === 0, 'Tag IDs should be empty');
});

test('should set and get search query', () => {
    FilterStore.setSearchQuery('hello');
    const filters = FilterStore.getFilters();
    assert(filters.searchQuery === 'hello', 'Search query should be "hello"');
});

test('should add and remove tag filters', () => {
    FilterStore.addTagFilter('tag1');
    FilterStore.addTagFilter('tag2');
    let filters = FilterStore.getFilters();
    assert(filters.tagIds.includes('tag1'), 'Should contain tag1');
    assert(filters.tagIds.includes('tag2'), 'Should contain tag2');
    assert(filters.tagIds.length === 2, 'Should have two tags');

    FilterStore.removeTagFilter('tag1');
    filters = FilterStore.getFilters();
    assert(!filters.tagIds.includes('tag1'), 'Should not contain tag1 after removal');
    assert(filters.tagIds.includes('tag2'), 'Should still contain tag2');
    assert(filters.tagIds.length === 1, 'Should have one tag after removal');
});

test('should clear all tag filters', () => {
    FilterStore.addTagFilter('tag1');
    FilterStore.addTagFilter('tag2');
    assert(FilterStore.getFilters().tagIds.length === 2, 'Should have two tags initially');

    FilterStore.clearTagFilters();
    assert(FilterStore.getFilters().tagIds.length === 0, 'Should have no tags after clearing');
});

test('should notify subscribers when search query changes', () => {
    // Use an array to capture notifications since subscribe calls immediately
    const notifications = [];
    const unsubscribe = FilterStore.subscribe((filters) => {
        notifications.push(filters.searchQuery);
    });

    FilterStore.setSearchQuery('test query');
    assert(notifications.length === 2, 'Subscriber should be notified twice: on subscribe and on change');
    assert(notifications[1] === 'test query', 'Second notification should reflect the change');

    unsubscribe();
    FilterStore.setSearchQuery('another query');
    assert(notifications.length === 2, 'Subscriber should not be notified after unsubscribe');
});

test('should notify subscribers when tag filters change', () => {
    const notifications = [];
    const unsubscribe = FilterStore.subscribe((filters) => {
        notifications.push([...filters.tagIds]);
    });

    FilterStore.addTagFilter('tagA');
    assert(notifications.length === 2, 'Subscriber notified twice');
    assert(notifications[1].includes('tagA'), 'Second notification should include tagA');

    FilterStore.removeTagFilter('tagA');
    assert(notifications.length === 3, 'Subscriber notified thrice');
    assert(notifications[2].length === 0, 'Third notification should show tag removed');

    unsubscribe();
    FilterStore.addTagFilter('tagB');
    assert(notifications.length === 3, 'Subscriber should not be notified after unsubscribe');
});

test('should not notify subscribers if search query is unchanged', () => {
    let callCount = 0;
    const handler = () => { callCount++; };
    const unsubscribe = FilterStore.subscribe(handler);
    const initialCallCount = callCount;

    FilterStore.setSearchQuery('same query');
    FilterStore.setSearchQuery('same query'); // Setting again with same value
    assert(callCount === initialCallCount + 1, 'Subscriber should only be called once for same query');
    unsubscribe();
});

test('should not notify subscribers if tag is already present', () => {
    let callCount = 0;
    const handler = () => { callCount++; };
    const unsubscribe = FilterStore.subscribe(handler);
    const initialCallCount = callCount;

    FilterStore.addTagFilter('tagX');
    FilterStore.addTagFilter('tagX'); // Adding same tag again
    assert(callCount === initialCallCount + 1, 'Subscriber should only be called once for same tag addition');
    unsubscribe();
});

test('should persist filters across reloads (simulated)', () => {
    FilterStore._clearAllFilters(); // Ensure fresh start
    FilterStore.setSearchQuery('persistent search');
    FilterStore.addTagFilter('persistent_tag_id');

    // Simulate reload by creating a new instance of FilterStore (conceptually)
    // For testing, we verify localStorage directly as module re-initialization is complex in a test runner.
    const storedFilters = JSON.parse(localStorage.getItem('swiss_notes_app_filters'));
    assert(storedFilters.searchQuery === 'persistent search', 'Stored search query should match');
    assert(storedFilters.tagIds.includes('persistent_tag_id'), 'Stored tag ID should match');
});

console.log('FilterStore tests finished.');