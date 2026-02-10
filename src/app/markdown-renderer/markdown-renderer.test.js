import { MarkdownRenderer } from './markdown-renderer.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (e) {
        console.error(`✗ ${name}`);
        console.error(e.stack);
        // Exit with an error code for CI/CD environments
        if (typeof process !== 'undefined' && process.exit) {
            process.exit(1);
        }
    }
}

console.log('Running MarkdownRenderer tests...');

test('should render an empty string for empty input', () => {
    assert(MarkdownRenderer.render('') === '', 'Empty string should return empty string');
});

test('should return an empty string for non-string input', () => {
    assert(MarkdownRenderer.render(null) === '', 'Null input should return empty string');
    assert(MarkdownRenderer.render(undefined) === '', 'Undefined input should return empty string');
    assert(MarkdownRenderer.render(123) === '', 'Number input should return empty string');
    assert(MarkdownRenderer.render({}) === '', 'Object input should return empty string');
});

test('should render basic paragraph text', () => {
    const markdown = 'This is a paragraph.';
    const expected = '<p>This is a paragraph.</p>';
    assert(MarkdownRenderer.render(markdown).trim() === expected, 'Basic text should be wrapped in <p>');
});

test('should render headings', () => {
    assert(MarkdownRenderer.render('# Heading 1').trim() === '<h1>Heading 1</h1>', '# should render H1');
    assert(MarkdownRenderer.render('## Heading 2').trim() === '<h2>Heading 2</h2>', '## should render H2');
    assert(MarkdownRenderer.render('### Heading 3').trim() === '<h3>Heading 3</h3>', '### should render H3');
});

test('should render bold text', () => {
    const markdown = 'This is **bold** text.';
    const expected = '<p>This is <strong>bold</strong> text.</p>';
    assert(MarkdownRenderer.render(markdown).trim() === expected, '** should render strong');
});

test('should render italic text', () => {
    const markdown = 'This is *italic* text.';
    const expected = '<p>This is <em>italic</em> text.</p>';
    assert(MarkdownRenderer.render(markdown).trim() === expected, '* should render em');
});

test('should render inline code', () => {
    const markdown = 'This is `inline code`.';
    const expected = '<p>This is <code>inline code</code>.</p>';
    assert(MarkdownRenderer.render(markdown).trim() === expected, '`code` should render code');
});

test('should render unordered lists', () => {
    const markdown = '- Item 1\n- Item 2';
    const expected = '<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>';
    assert(MarkdownRenderer.render(markdown).trim() === expected, 'Unordered list should render ul and li');
});

test('should render ordered lists', () => {
    const markdown = '1. First item\n2. Second item';
    const expected = '<ol>\n<li>First item</li>\n<li>Second item</li>\n</ol>';
    assert(MarkdownRenderer.render(markdown).trim() === expected, 'Ordered list should render ol and li');
});

test('should render a code block', () => {
    const markdown = '```javascript\nconsole.log("Hello");\n```';
    // Using a simplified check as exact HTML might vary slightly between markdown parsers for code blocks
    const output = MarkdownRenderer.render(markdown);
    assert(output.includes('<pre><code class="language-javascript">console.log(&quot;Hello&quot;);\n</code></pre>'), 'Fenced code block should render pre code');
});

test('should escape HTML in markdown content', () => {
    const markdown = '<script>alert("XSS")</script> **bold**';
    const expected = '<p>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; <strong>bold</strong></p>';
    assert(MarkdownRenderer.render(markdown).trim() === expected, 'HTML should be escaped');
});

console.log('All MarkdownRenderer tests complete.');
