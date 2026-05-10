# Concept Page — Common Interview Patterns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Common Interview Patterns" card-grid section to every DSA concept page, showing pattern name, recognition signal, and example problem.

**Architecture:** All changes are in `frontend/src/pages/DsaConceptPage.jsx`. Task 1 adds a `patterns` array to each of the 18 entries in the `CONCEPTS` object. Task 2 inserts the card-grid `<Section>` into the render between "When to Use" and "Time & Space Complexity". No new files, no new imports, no new state.

**Tech Stack:** React 18, inline styles, Vite (no test framework — verify via `npm run build`)

---

### Task 1: Add `patterns` data to all 18 CONCEPTS entries

**Files:**
- Modify: `frontend/src/pages/DsaConceptPage.jsx`

Each CONCEPTS entry currently ends with a `code` field. Add a `patterns` array **after** the `code` field in each entry. The closing `},` of each entry follows the patterns array.

- [ ] **Step 1: Add patterns to `arrays-hashing` entry**

Find the closing `},` of the `arrays-hashing` entry (after its `code` field). Insert before it:

```js
    patterns: [
      { name: 'Frequency Counter', signal: 'Store element counts in a Map when you need to know how many times each value appears. Classic for anagram checks and top-K problems.', example: 'Top K Frequent Elements' },
      { name: 'Two-Sum Complement', signal: 'Store seen values in a Set/Map; for each element check if its complement already exists. Turns O(n²) brute force into O(n).', example: 'Two Sum' },
      { name: 'Prefix Sum', signal: 'Precompute cumulative sums so any subarray sum is O(1). Combine with a Map to find subarrays summing to a target.', example: 'Product of Array Except Self' },
      { name: 'Grouping by Key', signal: 'Compute a canonical key for each element (sorted string for anagrams, remainder for divisibility) and group into a Map of arrays.', example: 'Group Anagrams' },
    ],
```

- [ ] **Step 2: Add patterns to `two-pointers` entry**

```js
    patterns: [
      { name: 'Inward Pointers', signal: 'Start one pointer at each end of a sorted array; advance the smaller/left or retreat the larger/right based on the current sum vs target.', example: 'Two Sum II - Input Array Is Sorted' },
      { name: 'Duplicate Skip', signal: 'After recording a result, advance the pointer past all identical values to avoid duplicate triplets/pairs.', example: '3Sum' },
      { name: 'Shrink the Smaller Wall', signal: 'In optimization problems with two boundaries, always move the side that limits the result — moving the taller wall can\'t improve it.', example: 'Container With Most Water' },
    ],
```

- [ ] **Step 3: Add patterns to `stack` entry**

```js
    patterns: [
      { name: 'Pending Match', signal: 'Push open elements onto the stack; when a closing element arrives, pop and verify the match.', example: 'Valid Parentheses' },
      { name: 'Monotonic Decreasing Stack', signal: 'Maintain indices of elements in decreasing order; when a larger element arrives, pop everything smaller — each popped element has found its "next greater".', example: 'Daily Temperatures' },
      { name: 'Previous Smaller / Span', signal: 'Stack of indices where each pop reveals the previous smaller element, enabling O(1) span or rectangle area calculations.', example: 'Largest Rectangle in Histogram' },
    ],
```

- [ ] **Step 4: Add patterns to `binary-search` entry**

```js
    patterns: [
      { name: 'Classic Left/Right Boundary', signal: 'Use lo < hi with hi = mid or lo = mid + 1 depending on whether mid is a valid candidate. Avoids off-by-one errors.', example: 'Find Minimum in Rotated Sorted Array' },
      { name: 'Binary Search on Answer', signal: 'When the answer is a value in a range and feasibility is monotonic, binary search the answer space and check feasibility at each midpoint.', example: 'Koko Eating Bananas' },
      { name: 'Which Half is Sorted?', signal: 'In a rotated array, one half is always sorted. Use that to decide which half the target lives in.', example: 'Search in Rotated Sorted Array' },
    ],
```

- [ ] **Step 5: Add patterns to `sliding-window` entry**

```js
    patterns: [
      { name: 'Variable Window — Expand/Shrink', signal: 'Right pointer expands; when a constraint is violated, advance left until valid again. Each element enters and exits the window at most once → O(n).', example: 'Longest Substring Without Repeating Characters' },
      { name: 'Fixed Window', signal: 'Slide a window of size k: add the new right element, remove the element that fell off the left.', example: 'Best Time to Buy and Sell Stock' },
      { name: 'Frequency Map Window', signal: 'Track character counts inside the window with a Map; shrink when a count exceeds the limit or when required characters are satisfied.', example: 'Minimum Window Substring' },
    ],
```

- [ ] **Step 6: Add patterns to `linked-list` entry**

```js
    patterns: [
      { name: 'Fast / Slow Pointers', signal: 'Move one pointer twice as fast. They meet inside a cycle (cycle detection) or slow reaches midpoint when fast reaches end (find middle).', example: 'Linked List Cycle' },
      { name: 'Pointer Reversal', signal: 'Track prev, curr, next; redirect curr.next = prev each step. Draw the state after each step before coding.', example: 'Reverse Linked List' },
      { name: 'Dummy Head Node', signal: 'Prepend a dummy node to avoid special-casing operations on the head. Return dummy.next at the end.', example: 'Merge Two Sorted Lists' },
      { name: 'Two-Pointer Gap', signal: 'Advance one pointer N steps ahead; then move both together. When the leader hits the end, the follower is at the target.', example: 'Remove Nth Node From End of List' },
    ],
```

- [ ] **Step 7: Add patterns to `trees` entry**

```js
    patterns: [
      { name: 'DFS Return Value', signal: 'Each recursive call returns something useful (max depth, path sum, subtree size). The parent combines left and right results.', example: 'Maximum Depth of Binary Tree' },
      { name: 'Global Variable + DFS', signal: 'Some answers (diameter, max path sum) span both subtrees and can\'t be returned up. Update a let best variable inside the DFS instead.', example: 'Binary Tree Maximum Path Sum' },
      { name: 'BFS Level Order', signal: 'Use a queue; at each level record queue.length before processing to know exactly how many nodes are in the current level.', example: 'Binary Tree Level Order Traversal' },
      { name: 'In-Order = Sorted', signal: 'In-order traversal of a BST visits nodes in ascending order. Use this to validate, find kth smallest, or convert BST to sorted array.', example: 'Kth Smallest Element in a BST' },
    ],
```

- [ ] **Step 8: Add patterns to `tries` entry**

```js
    patterns: [
      { name: 'TrieNode with children Map', signal: 'Each node holds children = {} and isEnd = false. Walk character by character; create nodes as needed on insert.', example: 'Implement Trie (Prefix Tree)' },
      { name: 'Prefix Pruning in DFS', signal: 'When searching a grid for words, check if the current path prefix exists in the trie before continuing. Prunes dead branches early.', example: 'Word Search II' },
      { name: 'Wildcard Match with DFS', signal: 'On a "." character, recurse into all children of the current node. On a letter, follow the specific child.', example: 'Design Add and Search Words Data Structure' },
    ],
```

- [ ] **Step 9: Add patterns to `backtracking` entry**

```js
    patterns: [
      { name: 'Choose / Explore / Undo', signal: 'Push a choice, recurse, then pop it. The undo step is what separates backtracking from plain DFS.', example: 'Subsets' },
      { name: 'Start Index to Avoid Reuse', signal: 'Pass a start index into each recursive call; only iterate from start onward to prevent using the same element twice.', example: 'Combination Sum' },
      { name: 'Constraint Check Before Recurse', signal: 'Validate the current partial solution before going deeper. Early rejection prunes entire subtrees.', example: 'N-Queens' },
      { name: 'Duplicate Skip in Sorted Input', signal: 'Sort first; skip nums[i] === nums[i-1] when i > start to avoid generating duplicate results.', example: 'Combination Sum II' },
    ],
```

- [ ] **Step 10: Add patterns to `heap-pq` entry**

```js
    patterns: [
      { name: 'Keep Top-K with Min-Heap', signal: 'Maintain a min-heap of size k. When size exceeds k, pop the minimum. What remains is the k largest.', example: 'Top K Frequent Elements' },
      { name: 'Two-Heap Split', signal: 'A max-heap for the lower half and a min-heap for the upper half. Rebalance after each insert so sizes differ by at most 1. Median = top of the larger heap.', example: 'Find Median from Data Stream' },
      { name: 'Merge K Sorted with Min-Heap', signal: 'Push the head of each list into a min-heap keyed by value. Pop minimum, push its successor. Runs in O(n log k).', example: 'Merge K Sorted Lists' },
    ],
```

- [ ] **Step 11: Add patterns to `graphs` entry**

```js
    patterns: [
      { name: 'BFS for Shortest Path', signal: 'In an unweighted graph, BFS guarantees the first time you reach a node is via the shortest path. Track visited before pushing to the queue.', example: 'Rotting Oranges' },
      { name: 'DFS Flood Fill', signal: 'Mark a cell visited, then recurse into all valid neighbors. Used for connected components and island counting.', example: 'Number of Islands' },
      { name: 'Union-Find for Connectivity', signal: 'find(x) with path compression + union(x, y) by rank. Check find(a) === find(b) to test connectivity in near-O(1).', example: 'Number of Connected Components in an Undirected Graph' },
      { name: 'Topological Sort (Kahn\'s)', signal: 'Build in-degree counts. Push all zero-in-degree nodes into a queue. Process queue: decrement neighbors\' in-degrees, push newly-zero ones.', example: 'Course Schedule' },
    ],
```

- [ ] **Step 12: Add patterns to `dp-1d` entry**

```js
    patterns: [
      { name: 'Define dp[i] Clearly', signal: 'State the exact meaning of dp[i] in one sentence before writing any code. The recurrence follows directly from the definition.', example: 'Climbing Stairs' },
      { name: 'Two-Variable Rolling', signal: 'When dp[i] only depends on dp[i-1] and dp[i-2], replace the array with two variables to get O(1) space.', example: 'House Robber' },
      { name: 'Unbounded Knapsack', signal: 'Iterate the coin/item array in the outer loop and amounts in the inner loop. The direction of the inner loop controls whether items can repeat.', example: 'Coin Change' },
    ],
```

- [ ] **Step 13: Add patterns to `intervals` entry**

```js
    patterns: [
      { name: 'Sort then Sweep', signal: 'Sort by start time; compare each interval\'s start against the previous result\'s end. Overlap: extend end. No overlap: append.', example: 'Merge Intervals' },
      { name: 'Three-Case Insert', signal: 'When inserting into a sorted list: (1) new interval ends before current starts → insert before; (2) overlaps → merge; (3) new interval starts after current ends → keep current.', example: 'Insert Interval' },
      { name: 'Min-Heap for Active Intervals', signal: 'Push end times into a min-heap. For each new interval, if its start > heap top, pop (meeting ended). Heap size = peak simultaneous intervals.', example: 'Meeting Rooms II' },
    ],
```

- [ ] **Step 14: Add patterns to `greedy` entry**

```js
    patterns: [
      { name: 'Track Reachability', signal: 'Instead of simulating each jump, track the farthest index reachable from any position seen so far. If current index > farthest, return false.', example: 'Jump Game' },
      { name: 'Greedy by Earliest End', signal: 'To maximize the number of non-overlapping intervals, always keep the interval with the earliest end time — it leaves maximum room for the rest.', example: 'Non-overlapping Intervals' },
      { name: 'Extend Current Partition', signal: 'Track the last occurrence of each character; greedily extend the current partition\'s boundary whenever a character\'s last occurrence is beyond it.', example: 'Partition Labels' },
    ],
```

- [ ] **Step 15: Add patterns to `advanced-graphs` entry**

```js
    patterns: [
      { name: 'Dijkstra = BFS + Priority Queue', signal: 'Replace BFS\'s queue with a min-heap keyed by cumulative distance. Skip stale entries with: if d > dist[u] continue.', example: 'Network Delay Time' },
      { name: 'Kruskal = Sort Edges + Union-Find', signal: 'Sort all edges by weight; add an edge only if its two endpoints are in different components (Union-Find check).', example: 'Min Cost to Connect All Points' },
      { name: 'Topological Sort for Order Problems', signal: 'Build a directed graph from ordering constraints; Kahn\'s BFS or DFS post-order gives a valid sequence (or detects a cycle).', example: 'Alien Dictionary' },
    ],
```

- [ ] **Step 16: Add patterns to `dp-2d` entry**

```js
    patterns: [
      { name: 'Index Both Strings', signal: 'dp[i][j] represents the answer for s1[0..i-1] and s2[0..j-1]. Base cases: empty string = 0 operations / 0 length.', example: 'Longest Common Subsequence' },
      { name: 'Match or Skip', signal: 'If characters match: extend from dp[i-1][j-1]. If not: take the best of skipping one character from either string.', example: 'Edit Distance' },
      { name: 'Rolling Row Optimization', signal: 'dp[i][j] only depends on the row above and the cell to the left. Replace the 2D table with a single 1D array updated in-place.', example: 'Coin Change II' },
    ],
```

- [ ] **Step 17: Add patterns to `bit-manipulation` entry**

```js
    patterns: [
      { name: 'XOR Self-Cancellation', signal: 'XOR all elements; duplicates cancel to 0, the unique element remains. Works because a ^ a = 0 and a ^ 0 = a.', example: 'Single Number' },
      { name: 'Clear Lowest Set Bit', signal: 'n &= (n - 1) removes the rightmost 1-bit. Loop count = number of set bits.', example: 'Number of 1 Bits' },
      { name: 'Isolate / Check Bit', signal: '(n >> i) & 1 reads bit i. n | (1 << i) sets it. n & ~(1 << i) clears it.', example: 'Reverse Bits' },
      { name: 'Bitmask for Subsets', signal: 'Represent a subset of n elements as an integer 0 to 2ⁿ-1. Bit i is set if element i is included. Iterate all subsets in O(2ⁿ).', example: 'Sum of Two Integers' },
    ],
```

- [ ] **Step 18: Add patterns to `math-geometry` entry**

```js
    patterns: [
      { name: 'Transpose + Reverse = Rotate', signal: 'To rotate a matrix 90° clockwise: transpose (swap [i][j] with [j][i]), then reverse each row. Counterclockwise: reverse rows first, then transpose.', example: 'Rotate Image' },
      { name: 'Shrinking Boundaries for Spiral', signal: 'Maintain top, bottom, left, right boundary pointers; after processing each side, move the corresponding boundary inward.', example: 'Spiral Matrix' },
      { name: 'Fast Exponentiation', signal: 'x^n = (x^(n/2))² for even n, x × x^(n-1) for odd n. Halves the exponent each step → O(log n).', example: 'Pow(x, n)' },
    ],
```

- [ ] **Step 19: Verify build passes**

```bash
cd F:/interview-coach/frontend
npm run build
```

Expected output ends with: `✓ built in <N>ms`

If you see any error like `patterns is not defined` or a JSX parse error, check that every entry has a properly closed `patterns` array and that no commas are missing between entries.

- [ ] **Step 20: Commit**

```bash
cd F:/interview-coach
git add frontend/src/pages/DsaConceptPage.jsx
git commit -m "feat: add patterns data to all 18 CONCEPTS entries"
```

---

### Task 2: Add Common Interview Patterns card-grid section to render

**Files:**
- Modify: `frontend/src/pages/DsaConceptPage.jsx` — the `DsaConceptPage` component's JSX return

- [ ] **Step 1: Locate the insertion point**

In the `DsaConceptPage` return JSX, find this block (around line 666):

```jsx
        {/* When to Use */}
        <Section title="When to Use">
          ...
        </Section>

        {/* Complexity Table */}
        <Section title="Time & Space Complexity">
```

Insert the new section between the closing `</Section>` of "When to Use" and the `{/* Complexity Table */}` comment.

- [ ] **Step 2: Insert the Common Interview Patterns section**

```jsx
        {/* Common Interview Patterns */}
        <Section title="Common Interview Patterns">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {concept.patterns.map((p, i) => (
              <div key={i} style={{
                background: '#161b22',
                border: '1px solid #21262d',
                borderLeft: '3px solid #388bfd',
                borderRadius: 8,
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f6fc' }}>{p.name}</div>
                <div style={{ fontSize: 12.5, fontStyle: 'italic', color: '#8b949e', marginTop: 6, lineHeight: 1.6 }}>
                  {p.signal}
                </div>
                <div style={{
                  fontSize: 11, color: '#58a6ff',
                  background: 'rgba(56,139,253,.1)',
                  borderRadius: 4, padding: '2px 7px',
                  marginTop: 10, display: 'inline-block',
                }}>
                  eg. {p.example}
                </div>
              </div>
            ))}
          </div>
        </Section>
```

- [ ] **Step 3: Verify build passes**

```bash
cd F:/interview-coach/frontend
npm run build
```

Expected output ends with: `✓ built in <N>ms`

- [ ] **Step 4: Verify in browser**

Open `http://localhost:5173/roadmap`, click any topic node, click "Learn Concept". Confirm:

1. A "Common Interview Patterns" section appears between "When to Use" and "Time & Space Complexity"
2. Cards render in a 2-column grid with a blue left accent bar
3. Each card shows: bold pattern name at top, italic muted signal text in the middle, blue `eg. <problem>` badge at the bottom
4. Check at least 3 different topics (e.g. Arrays & Hashing, Trees, DP 1D) to confirm all have patterns

- [ ] **Step 5: Commit**

```bash
cd F:/interview-coach
git add frontend/src/pages/DsaConceptPage.jsx
git commit -m "feat: add Common Interview Patterns card-grid section to concept page"
```
