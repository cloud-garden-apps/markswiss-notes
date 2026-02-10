export const MarkdownRenderer = {
    render(markdown) {
        if (typeof markdown !== 'string') {
            return '';
        }

        let html = markdown;

        // Escape HTML to prevent XSS
        html = html.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/"/g, '&quot;')
                   .replace(/'/g, '&#039;');

        // Headings (H1-H6) - apply before block processing
        html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold text (**text** or __text__)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic text (*text* or _text_)
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // Handle paragraphs and lists in a block-aware manner
        const lines = html.split(/\r?\n/);
        let resultHtml = [];
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // List items
            if (line.match(/^[-*+] (.+)/)) {
                if (!inList) {
                    resultHtml.push('<ul>');
                    inList = true;
                }
                resultHtml.push(`<li>${line.substring(line.indexOf(' ') + 1)}</li>`);
            } else {
                if (inList) {
                    resultHtml.push('</ul>');
                    inList = false;
                }
                // Paragraphs: Only add if not empty and not already a block element
                if (line.length > 0 && !line.match(/^<h[1-6]>|^<p>/)) { // Check if it's not a heading or already a paragraph (from previous processing)
                    resultHtml.push(`<p>${line}</p>`);
                } else if (line.length > 0) { // If it's a non-empty line that's already a block (like a heading), just push it
                    resultHtml.push(line);
                }
            }
        }

        if (inList) {
            resultHtml.push('</ul>');
        }

        return resultHtml.join('\n');
    }
};
