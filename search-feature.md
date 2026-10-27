The "Find a story…" search feature is a client-side instant filter built directly into the home page route (`src/routes/index.tsx`). 

Here is how the code works step by step:

---

1. State Management & Controlled Input
At the top of the `Index` component, a React state variable stores whatever the user types:

```tsx
const [query, setQuery] = useState('')
```

The search bar is rendered inside `<div className="story-toolbar">` as a controlled input:

```tsx
<label className="search-field">
  <Search />
  <input 
    aria-label="Search stories" 
    placeholder="Find a story…" 
    value={query} 
    onChange={event => setQuery(event.target.value)}
  />
</label>
```
Every keystroke fires `onChange`, updating `query`. Because this triggers a component re-render, the story list updates immediately without needing an Enter press or form submission.

---

2. The Filter Logic
The array of visible stories is computed on every render using JavaScript's `.filter()`:

```tsx
const visible = stories.filter((story, index) => 
  (category === 'All stories' && !query ? index > 0 : true) &&
  (category === 'All stories' || story.category === category) &&
  `${story.title} ${story.subtitle} ${story.category} ${story.author}`
    .toLowerCase()
    .includes(query.toLowerCase())
)
```

This filter evaluates three conditions:

1. Multi-field matching & Case-insensitivity:
   ```tsx
   `${story.title} ${story.subtitle} ${story.category} ${story.author}`.toLowerCase().includes(query.toLowerCase())
   ```
   Instead of searching only by title, it joins the title, subtitle, category, and author into a single lowercase string. This allows users to find stories by topic keywords, author names, or category terms regardless of capitalization.

2. Smart handling of the Featured Story:
   ```tsx
   category === 'All stories' && !query ? index > 0 : true
   ```
   Under default conditions (empty search and "All stories" selected), the first story (`index: 0`) is hidden from the grid because it is already showcased above in the large "Editor's Pick" hero section. However, as soon as a user starts searching (`query` is not empty), the first story is included in the search pool so it isn't missed.

3. Combined Category Filtering:
   ```tsx
   category === 'All stories' || story.category === category
   ```
   Search works together with the category buttons, so searching while inside a category restricts results to that category.

---

3. Rendering and Empty State
The filtered results are displayed in `<div className="story-grid">`:

```tsx
<div className="story-grid">
  {visible.map(story => (
    <article className="story-card" key={story.slug}>
      {/* Story card details */}
    </article>
  ))}

  {visible.length === 0 && (
    <p className="empty-state">No stories found. Try another word or category.</p>
  )}
</div>
```
When no stories match both the search query and the selected category, it cleanly renders an empty-state message inviting the user to try another term.

---

Potential Enhancements
If you'd like to extend this feature later, we could:
- Add a clear button (✕) to quickly reset the input.
- Highlight matching text within story titles and subtitles.
- Add tag or date filtering.
 
## Add a clear button (✕) to the search input

To add a clear button (✕) to the search input, you combine conditional rendering, state reset, and accessible button markup.

Here is how the code works piece by piece:

---

1. The Core JSX & Conditional Rendering

Currently, the search bar in `src/routes/index.tsx` looks like this:

```tsx
<label className="search-field">
  <Search />
  <input
    aria-label="Search stories"
    placeholder="Find a story…"
    value={query}
    onChange={event => setQuery(event.target.value)}
  />
</label>
```

To add the clear button, we conditionally render a button only when `query` is not empty (`query.length > 0`):

```tsx
<div className="search-field">
  <Search aria-hidden="true" />
  <input
    aria-label="Search stories"
    placeholder="Find a story…"
    value={query}
    onChange={event => setQuery(event.target.value)}
  />
  {query && (
    <button
      type="button"
      className="search-clear"
      aria-label="Clear search"
      onClick={() => setQuery('')}
    >
      <X size={14} />
    </button>
  )}
</div>
```

---

2. How Each Part Works

- `{query && (...)}` (Conditional display):  
  If `query` is `""` (empty string / falsy), React renders nothing. As soon as the user types even one character, `query` becomes truthy, causing the `✕` button to appear on the right side of the input.

- `onClick={() => setQuery('')}` (Resetting the state):  
  Clicking the button updates React state back to an empty string. Because `visible` stories are derived from `query`, the story grid instantly reverts back to showing all stories for the selected category.

- `type="button"`:  
  By default in HTML, `<button>` elements have `type="submit"`. Explicitly setting `type="button"` prevents unintended form submissions if the search is ever wrapped in a `<form>`.

- `aria-label="Clear search"`:  
  Because an icon `✕` has no inner text, screen readers rely on `aria-label` to announce "Clear search" to visually impaired users instead of reading an unlabelled button.

- Switching outer `<label>` to `<div>`:  
  In standard HTML, clicking any element inside a `<label>` delegates a click/focus event to the associated `<input>`. Changing the outer wrapper to a `<div>` and keeping `aria-label="Search stories"` directly on the `<input>` ensures clicking the clear button cleanly executes the button's action without event conflicts.

---

3. Accompanying CSS

To place the button neatly inside the right edge of the input pill:

```css
.search-field {
  display: flex;
  align-items: center;
  position: relative;
  /* ...existing styles... */
}

.search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--muted-foreground);
  border-radius: 9999px;
  transition: color 0.15s ease, opacity 0.15s ease;
}

.search-clear:hover {
  color: var(--foreground);
}
```

---

Whenever you'd like to implement this clear button into the site, let me know and we can switch to Build mode to wire it up!

## Highlighting search terms

Highlighting search terms in React requires splitting the text into matching and non-matching segments while preserving the original character casing.

Here is a breakdown of how this code works:

---

1. The Core Helper Component

You create a small, reusable component—for example, `<HighlightText />`:

```tsx
function HighlightText({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim()

  // 1. If there's no search term, return normal text
  if (!trimmed) return <>{text}</>

  // 2. Escape any special regex characters typed by the user (like ., *, ?, etc.)
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // 3. Split the text using a capturing group () with case-insensitive (i) flag
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  // 4. Wrap matching parts in a semantic <mark> tag
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark key={index} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}
```

---

2. How the Logic Works Step-by-Step

A. Regex Escaping
```tsx
const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
```
If a user searches for `C++` or `(Tokyo)`, those characters have special meaning in regular expressions. Escaping them prepends a backslash (`\`), ensuring they are matched literally as characters rather than treated as regex commands.

B. The Capturing Group Trick in `split()`
```tsx
const regex = new RegExp(`(${escaped})`, 'gi')
const parts = text.split(regex)
```
In JavaScript, when `string.split()` receives a regular expression with capturing parentheses `()`, the matched delimiters are retained in the returned array:

For example:
- Text: `"Midnight in Manhattan"`
- Query: `"man"`
- Resulting array: `["Midnight in ", "Man", "hattan"]`

Because the capturing group keeps the exact match as its own slice in the array, the original capitalization (`"Man"`, not lowercase `"man"`) is preserved.

C. Case-Insensitive Comparison & Semantic `<mark>`
```tsx
parts.map((part, index) =>
  part.toLowerCase() === trimmed.toLowerCase() ? (
    <mark key={index} className="search-highlight">{part}</mark>
  ) : (
    part
  )
)
```
We compare both in lowercase to check if the chunk is the match. If it matches, we wrap it in HTML5's `<mark>` element, which is the semantic tag specifically designed for text marked or highlighted for reference purposes.

---

3. Usage in the Story Cards

Inside `src/routes/index.tsx`, wherever titles and subtitles are rendered, you replace the raw string with the `<HighlightText>` component:

```tsx
<h3>
  <Link to="/stories/$slug" params={{ slug: story.slug }}>
    <HighlightText text={story.title} query={query} />
  </Link>
</h3>

<p>
  <HighlightText text={story.subtitle} query={query} />
</p>
```

---

4. Styling the Highlight

By default, browsers give `<mark>` a bright yellow background. You can style it to fit the blog's aesthetic in `src/styles.css`:

```css
mark.search-highlight {
  background-color: color-mix(in srgb, var(--primary) 18%, transparent);
  color: inherit;
  font-weight: 600;
  padding: 0 2px;
  border-radius: 2px;
}
```

This creates a subtle highlight that blends with your theme colors rather than looking like an unstyled yellow marker.

---

Would you like to put this or the clear button into the actual project? If so, just let me know and we can switch to Build mode to add them.