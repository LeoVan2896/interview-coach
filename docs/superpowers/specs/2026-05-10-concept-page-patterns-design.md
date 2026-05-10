# Concept Page — Common Interview Patterns Section Design

**Date:** 2026-05-10
**File affected:** `frontend/src/pages/DsaConceptPage.jsx`

---

## Overview

Add a "Common Interview Patterns" section to the DSA concept page. Each pattern entry gives the user a named pattern, a recognition signal ("when you see X, think this"), and a representative example problem. The section renders as a 2-column card grid positioned between "When to Use" and "Time & Space Complexity".

---

## Data Shape

Add a `patterns` array to every entry in the `CONCEPTS` object. Each item:

```js
{
  name: 'Sliding Window',
  signal: 'Contiguous subarray or substring with a size or constraint — find max/min/longest/shortest',
  example: 'Longest Substring Without Repeating Characters'
}
```

- `name` — pattern name, bold card header
- `signal` — 1–2 sentence recognition cue shown in muted italic
- `example` — one representative problem from that topic's NeetCode 150 list

All 18 topics get `patterns` arrays with 3–5 entries each.

---

## Section Position

New section inserted between "When to Use" and "Time & Space Complexity":

```
Overview
When to Use
Common Interview Patterns   ← new
Time & Space Complexity
Code Example
```

---

## Card Grid UI

```jsx
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
        {/* Pattern name */}
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f6fc' }}>{p.name}</div>
        {/* Signal */}
        <div style={{ fontSize: 12.5, fontStyle: 'italic', color: '#8b949e', marginTop: 6, lineHeight: 1.6 }}>
          {p.signal}
        </div>
        {/* Example badge */}
        <div style={{
          fontSize: 11, color: '#58a6ff',
          background: 'rgba(56,139,253,.1)',
          borderRadius: 4, padding: '2px 7px',
          marginTop: 10, display: 'inline-block'
        }}>
          eg. {p.example}
        </div>
      </div>
    ))}
  </div>
</Section>
```

---

## Patterns Content (all 18 topics)

### arrays-hashing
1. `Frequency Counter` — Store element counts in a Map when you need to know how many times each value appears. Classic for anagram checks and top-K problems. — *eg. Top K Frequent Elements*
2. `Two-Sum Complement` — Store seen values in a Set/Map; for each element check if its complement already exists. Turns O(n²) brute force into O(n). — *eg. Two Sum*
3. `Prefix Sum` — Precompute cumulative sums so any subarray sum is O(1). Combine with a Map to find subarrays summing to a target. — *eg. Product of Array Except Self*
4. `Grouping by Key` — Compute a canonical key for each element (sorted string for anagrams, remainder for divisibility) and group into a Map of arrays. — *eg. Group Anagrams*

### two-pointers
1. `Inward Pointers` — Start one pointer at each end of a sorted array; advance the smaller/left or retreat the larger/right based on the current sum vs target. — *eg. Two Sum II*
2. `Duplicate Skip` — After recording a result, advance the pointer past all identical values to avoid duplicate triplets/pairs. — *eg. 3Sum*
3. `Shrink the Smaller Wall` — In optimization problems with two boundaries, always move the side that limits the result — moving the taller wall can't improve it. — *eg. Container With Most Water*

### stack
1. `Pending Match` — Push open elements onto the stack; when a closing element arrives, pop and verify the match. — *eg. Valid Parentheses*
2. `Monotonic Decreasing Stack` — Maintain indices of elements in decreasing order; when a larger element arrives, pop everything smaller — each popped element has found its "next greater". — *eg. Daily Temperatures*
3. `Previous Smaller / Span` — Stack of indices where each pop reveals the previous smaller element, enabling O(1) span or rectangle area calculations. — *eg. Largest Rectangle in Histogram*

### binary-search
1. `Classic Left/Right Boundary` — Use `lo < hi` with `hi = mid` or `lo = mid + 1` depending on whether mid is a valid candidate. Avoids off-by-one errors. — *eg. Find Minimum in Rotated Sorted Array*
2. `Binary Search on Answer` — When the answer is a value in a range and feasibility is monotonic, binary search the answer space and check feasibility at each midpoint. — *eg. Koko Eating Bananas*
3. `Which Half is Sorted?` — In a rotated array, one half is always sorted. Use that to decide which half the target lives in. — *eg. Search in Rotated Sorted Array*

### sliding-window
1. `Variable Window — Expand/Shrink` — Right pointer expands; when a constraint is violated, advance left until valid again. Each element enters and exits the window at most once → O(n). — *eg. Longest Substring Without Repeating Characters*
2. `Fixed Window` — Slide a window of size k: add the new right element, remove the element that fell off the left. — *eg. Best Time to Buy and Sell Stock*
3. `Frequency Map Window` — Track character counts inside the window with a Map; shrink when a count exceeds the limit or when required characters are satisfied. — *eg. Minimum Window Substring*

### linked-list
1. `Fast / Slow Pointers` — Move one pointer twice as fast. They meet inside a cycle (cycle detection) or slow reaches midpoint when fast reaches end (find middle). — *eg. Linked List Cycle*
2. `Pointer Reversal` — Track `prev`, `curr`, `next`; redirect `curr.next = prev` each step. Draw the state after each step before coding. — *eg. Reverse Linked List*
3. `Dummy Head Node` — Prepend a dummy node to avoid special-casing operations on the head. Return `dummy.next` at the end. — *eg. Merge Two Sorted Lists*
4. `Two-Pointer Gap` — Advance one pointer N steps ahead; then move both together. When the leader hits the end, the follower is at the target. — *eg. Remove Nth Node From End of List*

### trees
1. `DFS Return Value` — Each recursive call returns something useful (max depth, path sum, subtree size). The parent combines left and right results. — *eg. Maximum Depth of Binary Tree*
2. `Global Variable + DFS` — Some answers (diameter, max path sum) span both subtrees and can't be returned up. Update a `let best` variable inside the DFS instead. — *eg. Binary Tree Maximum Path Sum*
3. `BFS Level Order` — Use a queue; at each level record `queue.length` before processing to know exactly how many nodes are in the current level. — *eg. Binary Tree Level Order Traversal*
4. `In-Order = Sorted` — In-order traversal of a BST visits nodes in ascending order. Use this to validate, find kth smallest, or convert BST to sorted array. — *eg. Kth Smallest Element in a BST*

### tries
1. `TrieNode with children Map` — Each node holds `children = {}` and `isEnd = false`. Walk character by character; create nodes as needed on insert. — *eg. Implement Trie*
2. `Prefix Pruning in DFS` — When searching a grid for words, check if the current path prefix exists in the trie before continuing. Prunes dead branches early. — *eg. Word Search II*
3. `Wildcard Match with DFS` — On a `.` character, recurse into all children of the current node. On a letter, follow the specific child. — *eg. Design Add and Search Words Data Structure*

### backtracking
1. `Choose / Explore / Undo` — Push a choice, recurse, then pop it. The undo step is what separates backtracking from plain DFS. — *eg. Subsets*
2. `Start Index to Avoid Reuse` — Pass a `start` index into each recursive call; only iterate from `start` onward to prevent using the same element twice. — *eg. Combination Sum*
3. `Constraint Check Before Recurse` — Validate the current partial solution before going deeper. Early rejection prunes entire subtrees. — *eg. N-Queens*
4. `Duplicate Skip in Sorted Input` — Sort first; skip `nums[i] === nums[i-1]` when `i > start` to avoid generating duplicate results. — *eg. Combination Sum II*

### heap-pq
1. `Keep Top-K with Min-Heap` — Maintain a min-heap of size k. When size exceeds k, pop the minimum. What remains is the k largest. — *eg. Top K Frequent Elements*
2. `Two-Heap Split` — A max-heap for the lower half and a min-heap for the upper half. Rebalance after each insert so sizes differ by at most 1. Median = top of the larger heap (or average of both tops). — *eg. Find Median from Data Stream*
3. `Merge K Sorted with Min-Heap` — Push the head of each list into a min-heap keyed by value. Pop minimum, push its successor. Runs in O(n log k). — *eg. Merge K Sorted Lists*

### graphs
1. `BFS for Shortest Path` — In an unweighted graph, BFS guarantees the first time you reach a node is via the shortest path. Track visited before pushing to the queue. — *eg. Rotting Oranges*
2. `DFS Flood Fill` — Mark a cell visited, then recurse into all valid neighbors. Used for connected components and island counting. — *eg. Number of Islands*
3. `Union-Find for Connectivity` — `find(x)` with path compression + `union(x, y)` by rank. Check `find(a) === find(b)` to test connectivity in near-O(1). — *eg. Number of Connected Components in an Undirected Graph*
4. `Topological Sort (Kahn's)` — Build in-degree counts. Push all zero-in-degree nodes into a queue. Process queue: decrement neighbors' in-degrees, push newly-zero ones. — *eg. Course Schedule*

### dp-1d
1. `Define dp[i] Clearly` — State the exact meaning of `dp[i]` in one sentence before writing any code. The recurrence follows directly from the definition. — *eg. Climbing Stairs*
2. `Two-Variable Rolling` — When `dp[i]` only depends on `dp[i-1]` and `dp[i-2]`, replace the array with two variables to get O(1) space. — *eg. House Robber*
3. `Unbounded Knapsack` — Iterate the coin/item array in the outer loop and amounts in the inner loop (or vice versa). The direction of the inner loop controls whether items can repeat. — *eg. Coin Change*

### intervals
1. `Sort then Sweep` — Sort by start time; compare each interval's start against the previous result's end. Overlap: extend end. No overlap: append. — *eg. Merge Intervals*
2. `Three-Case Insert` — When inserting into a sorted list: (1) new interval ends before current starts → insert before; (2) overlaps → merge; (3) new interval starts after current ends → keep current. — *eg. Insert Interval*
3. `Min-Heap for Active Intervals` — Push end times into a min-heap. For each new interval, if its start > heap top, pop (meeting ended). Heap size = peak simultaneous intervals. — *eg. Meeting Rooms II*

### greedy
1. `Track Reachability` — Instead of simulating each jump, track the farthest index reachable from any position seen so far. If current index > farthest, return false. — *eg. Jump Game*
2. `Greedy by Earliest End` — To maximize the number of non-overlapping intervals, always keep the interval with the earliest end time — it leaves maximum room for the rest. — *eg. Non-overlapping Intervals*
3. `Extend Current Partition` — Track the last occurrence of each character; greedily extend the current partition's boundary whenever a character's last occurrence is beyond it. — *eg. Partition Labels*

### advanced-graphs
1. `Dijkstra = BFS + Priority Queue` — Replace BFS's queue with a min-heap keyed by cumulative distance. Skip stale entries with `if d > dist[u]: continue`. — *eg. Network Delay Time*
2. `Kruskal = Sort Edges + Union-Find` — Sort all edges by weight; add an edge only if its two endpoints are in different components (Union-Find check). — *eg. Min Cost to Connect All Points*
3. `Topological Sort for Order Problems` — Build a directed graph from ordering constraints; Kahn's BFS or DFS post-order gives a valid sequence (or detects a cycle). — *eg. Alien Dictionary*

### dp-2d
1. `Index Both Strings` — `dp[i][j]` represents the answer for `s1[0..i-1]` and `s2[0..j-1]`. Base cases: empty string = 0 operations/0 length. — *eg. Longest Common Subsequence*
2. `Match or Skip` — If characters match: extend from `dp[i-1][j-1]`. If not: take the best of skipping one character from either string. — *eg. Edit Distance*
3. `Rolling Row Optimization` — `dp[i][j]` only depends on the row above and the cell to the left. Replace the 2D table with a single 1D array updated in-place (right-to-left for 0/1 knapsack). — *eg. Target Sum*

### bit-manipulation
1. `XOR Self-Cancellation` — XOR all elements; duplicates cancel to 0, the unique element remains. Works because `a ^ a = 0` and `a ^ 0 = a`. — *eg. Single Number*
2. `Clear Lowest Set Bit` — `n &= (n - 1)` removes the rightmost 1-bit. Loop count = number of set bits. — *eg. Number of 1 Bits*
3. `Isolate / Check Bit` — `(n >> i) & 1` reads bit i. `n | (1 << i)` sets it. `n & ~(1 << i)` clears it. — *eg. Reverse Bits*
4. `Bitmask for Subsets` — Represent a subset of n elements as an integer 0 to 2ⁿ-1. Bit i is set if element i is included. Iterate all subsets in O(2ⁿ). — *eg. Sum of Two Integers*

### math-geometry
1. `Transpose + Reverse = Rotate` — To rotate a matrix 90° clockwise: transpose (swap `[i][j]` with `[j][i]`), then reverse each row. Counterclockwise: reverse rows first, then transpose. — *eg. Rotate Image*
2. `Shrinking Boundaries for Spiral` — Maintain `top`, `bottom`, `left`, `right` boundary pointers; after processing each side, move the corresponding boundary inward. — *eg. Spiral Matrix*
3. `Fast Exponentiation` — `x^n = (x^(n/2))² ` for even n, `x × x^(n-1)` for odd n. Halves the exponent each step → O(log n). — *eg. Pow(x, n)*

---

## What Does NOT Change

- `Section` helper component — unchanged
- All existing `CONCEPTS` fields (`summary`, `whenToUse`, `complexity`, `code`) — unchanged
- Page layout, scroll behavior, back button, title — unchanged
- `DsaRoadmapPage.jsx`, `dsaData.js`, `App.jsx` — not touched
