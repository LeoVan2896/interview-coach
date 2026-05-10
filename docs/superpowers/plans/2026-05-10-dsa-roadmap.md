# DSA Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/roadmap` ComingSoon placeholder with a fully-functional NeetCode 150 DSA dependency-graph roadmap page backed by localStorage progress tracking.

**Architecture:** Two new files — `src/data/dsaData.js` holds all static NeetCode 150 topic and problem data (positions, edges, prereqs, problems); `src/pages/DsaRoadmapPage.jsx` renders the dependency graph (SVG arrows + absolutely-positioned nodes) and a right detail panel. Progress is persisted in `localStorage` under the key `dsa_progress` as a flat `{ problemId: true }` object. One line changes in `App.jsx`.

**Tech Stack:** React 18, React Router v6, vanilla CSS-in-JS (inline styles), localStorage API — no new dependencies.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/data/dsaData.js` | All 18 NeetCode 150 topics with node positions, edge list, prereqs, and problems |
| Create | `src/pages/DsaRoadmapPage.jsx` | Full page: nav bar, scrollable SVG graph, right detail panel, localStorage state |
| Modify | `src/App.jsx` | Import DsaRoadmapPage, swap ComingSoon on the `/roadmap` route |

---

## Task 1: Create dsaData.js

**Files:**
- Create: `src/data/dsaData.js`

This file exports one array: `TOPICS`. Each topic has:
- `id` — kebab-case unique string
- `label` — display name
- `pos` — `{ left, top }` pixel position on the 680×710 canvas
- `width` — node width in px (148 for most, 110 or 130 for row-7 nodes)
- `edges` — array of topic ids this node points TO (downstream dependencies)
- `prereqs` — array of human-readable topic label strings shown in the right panel
- `problems` — array of `{ id, title, difficulty, leetcodeUrl }` objects

- [ ] **Step 1: Create the file with all 18 topics and 150 problems**

`src/data/dsaData.js`:

```js
export const TOPICS = [
  {
    id: 'arrays-hashing',
    label: 'Arrays & Hashing',
    pos: { left: 266, top: 10 },
    width: 148,
    edges: ['two-pointers', 'stack'],
    prereqs: [],
    problems: [
      { id: 'contains-duplicate',          title: 'Contains Duplicate',              difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/' },
      { id: 'valid-anagram',               title: 'Valid Anagram',                   difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/' },
      { id: 'two-sum',                     title: 'Two Sum',                         difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
      { id: 'group-anagrams',              title: 'Group Anagrams',                  difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/' },
      { id: 'top-k-frequent-elements',     title: 'Top K Frequent Elements',         difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { id: 'encode-and-decode-strings',   title: 'Encode and Decode Strings',       difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/encode-and-decode-strings/' },
      { id: 'product-of-array-except-self',title: 'Product of Array Except Self',    difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/' },
      { id: 'valid-sudoku',                title: 'Valid Sudoku',                    difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/valid-sudoku/' },
      { id: 'longest-consecutive-sequence',title: 'Longest Consecutive Sequence',    difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
    ],
  },
  {
    id: 'two-pointers',
    label: 'Two Pointers',
    pos: { left: 96, top: 100 },
    width: 148,
    edges: ['binary-search', 'sliding-window'],
    prereqs: ['Arrays & Hashing'],
    problems: [
      { id: 'valid-palindrome',             title: 'Valid Palindrome',                difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
      { id: 'two-sum-ii',                   title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { id: '3sum',                         title: '3Sum',                            difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/3sum/' },
      { id: 'container-with-most-water',    title: 'Container With Most Water',       difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/' },
      { id: 'trapping-rain-water',          title: 'Trapping Rain Water',             difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/' },
    ],
  },
  {
    id: 'stack',
    label: 'Stack',
    pos: { left: 436, top: 100 },
    width: 148,
    edges: ['sliding-window', 'linked-list'],
    prereqs: ['Arrays & Hashing'],
    problems: [
      { id: 'valid-parentheses',                    title: 'Valid Parentheses',                         difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/' },
      { id: 'min-stack',                            title: 'Min Stack',                                 difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/min-stack/' },
      { id: 'evaluate-reverse-polish-notation',     title: 'Evaluate Reverse Polish Notation',          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
      { id: 'generate-parentheses',                 title: 'Generate Parentheses',                      difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/generate-parentheses/' },
      { id: 'daily-temperatures',                   title: 'Daily Temperatures',                        difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/' },
      { id: 'car-fleet',                            title: 'Car Fleet',                                 difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/car-fleet/' },
      { id: 'largest-rectangle-in-histogram',       title: 'Largest Rectangle in Histogram',            difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
    ],
  },
  {
    id: 'binary-search',
    label: 'Binary Search',
    pos: { left: 10, top: 192 },
    width: 148,
    edges: ['trees'],
    prereqs: ['Two Pointers'],
    problems: [
      { id: 'binary-search',                          title: 'Binary Search',                                difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/binary-search/' },
      { id: 'search-a-2d-matrix',                     title: 'Search a 2D Matrix',                           difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/' },
      { id: 'koko-eating-bananas',                    title: 'Koko Eating Bananas',                          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/' },
      { id: 'find-minimum-in-rotated-sorted-array',   title: 'Find Minimum in Rotated Sorted Array',         difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      { id: 'search-in-rotated-sorted-array',         title: 'Search in Rotated Sorted Array',               difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { id: 'time-based-key-value-store',             title: 'Time Based Key-Value Store',                   difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/' },
      { id: 'median-of-two-sorted-arrays',            title: 'Median of Two Sorted Arrays',                  difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
    ],
  },
  {
    id: 'sliding-window',
    label: 'Sliding Window',
    pos: { left: 266, top: 192 },
    width: 148,
    edges: ['trees'],
    prereqs: ['Two Pointers', 'Stack'],
    problems: [
      { id: 'best-time-to-buy-and-sell-stock',                  title: 'Best Time to Buy and Sell Stock',                    difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { id: 'longest-substring-without-repeating-characters',   title: 'Longest Substring Without Repeating Characters',     difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: 'longest-repeating-character-replacement',          title: 'Longest Repeating Character Replacement',            difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
      { id: 'permutation-in-string',                            title: 'Permutation in String',                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/' },
      { id: 'minimum-window-substring',                         title: 'Minimum Window Substring',                           difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/' },
      { id: 'sliding-window-maximum',                           title: 'Sliding Window Maximum',                             difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/' },
    ],
  },
  {
    id: 'linked-list',
    label: 'Linked List',
    pos: { left: 436, top: 192 },
    width: 148,
    edges: ['trees'],
    prereqs: ['Stack'],
    problems: [
      { id: 'reverse-linked-list',                  title: 'Reverse Linked List',                       difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'merge-two-sorted-lists',               title: 'Merge Two Sorted Lists',                    difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: 'linked-list-cycle',                    title: 'Linked List Cycle',                         difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 'reorder-list',                         title: 'Reorder List',                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/' },
      { id: 'remove-nth-node-from-end-of-list',     title: 'Remove Nth Node From End of List',          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
      { id: 'copy-list-with-random-pointer',        title: 'Copy List with Random Pointer',             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/' },
      { id: 'add-two-numbers',                      title: 'Add Two Numbers',                           difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/' },
      { id: 'find-the-duplicate-number',            title: 'Find the Duplicate Number',                 difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/' },
      { id: 'lru-cache',                            title: 'LRU Cache',                                 difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/lru-cache/' },
      { id: 'merge-k-sorted-lists',                 title: 'Merge K Sorted Lists',                      difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { id: 'reverse-nodes-in-k-group',             title: 'Reverse Nodes in k-Group',                  difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
    ],
  },
  {
    id: 'trees',
    label: 'Trees',
    pos: { left: 266, top: 282 },
    width: 148,
    edges: ['tries', 'backtracking'],
    prereqs: ['Binary Search', 'Sliding Window', 'Linked List'],
    problems: [
      { id: 'invert-binary-tree',                                      title: 'Invert Binary Tree',                                         difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/' },
      { id: 'maximum-depth-of-binary-tree',                            title: 'Maximum Depth of Binary Tree',                               difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: 'diameter-of-binary-tree',                                 title: 'Diameter of Binary Tree',                                    difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
      { id: 'balanced-binary-tree',                                    title: 'Balanced Binary Tree',                                       difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/balanced-binary-tree/' },
      { id: 'same-tree',                                               title: 'Same Tree',                                                  difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/same-tree/' },
      { id: 'subtree-of-another-tree',                                 title: 'Subtree of Another Tree',                                    difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/' },
      { id: 'lowest-common-ancestor-of-a-binary-search-tree',         title: 'Lowest Common Ancestor of a Binary Search Tree',             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
      { id: 'binary-tree-level-order-traversal',                       title: 'Binary Tree Level Order Traversal',                          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { id: 'binary-tree-right-side-view',                             title: 'Binary Tree Right Side View',                                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
      { id: 'count-good-nodes-in-binary-tree',                         title: 'Count Good Nodes in Binary Tree',                            difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/' },
      { id: 'validate-binary-search-tree',                             title: 'Validate Binary Search Tree',                                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/' },
      { id: 'kth-smallest-element-in-a-bst',                          title: 'Kth Smallest Element in a BST',                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
      { id: 'construct-binary-tree-from-preorder-and-inorder-traversal', title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
      { id: 'binary-tree-maximum-path-sum',                            title: 'Binary Tree Maximum Path Sum',                               difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
      { id: 'serialize-and-deserialize-binary-tree',                   title: 'Serialize and Deserialize Binary Tree',                      difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
    ],
  },
  {
    id: 'tries',
    label: 'Tries',
    pos: { left: 96, top: 372 },
    width: 148,
    edges: ['heap-pq'],
    prereqs: ['Trees'],
    problems: [
      { id: 'implement-trie-prefix-tree',                          title: 'Implement Trie (Prefix Tree)',                     difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
      { id: 'design-add-and-search-words-data-structure',          title: 'Design Add and Search Words Data Structure',       difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' },
      { id: 'word-search-ii',                                      title: 'Word Search II',                                  difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/' },
    ],
  },
  {
    id: 'backtracking',
    label: 'Backtracking',
    pos: { left: 436, top: 372 },
    width: 148,
    edges: ['heap-pq', 'graphs', 'dp-1d'],
    prereqs: ['Trees'],
    problems: [
      { id: 'subsets',                              title: 'Subsets',                                   difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets/' },
      { id: 'combination-sum',                      title: 'Combination Sum',                           difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum/' },
      { id: 'permutations',                         title: 'Permutations',                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutations/' },
      { id: 'subsets-ii',                           title: 'Subsets II',                                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets-ii/' },
      { id: 'combination-sum-ii',                   title: 'Combination Sum II',                        difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-ii/' },
      { id: 'word-search',                          title: 'Word Search',                               difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-search/' },
      { id: 'palindrome-partitioning',              title: 'Palindrome Partitioning',                   difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/' },
      { id: 'letter-combinations-of-a-phone-number',title: 'Letter Combinations of a Phone Number',    difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/' },
      { id: 'n-queens',                             title: 'N-Queens',                                  difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/n-queens/' },
    ],
  },
  {
    id: 'heap-pq',
    label: 'Heap / Priority Queue',
    pos: { left: 10, top: 457 },
    width: 148,
    edges: ['intervals', 'greedy'],
    prereqs: ['Tries', 'Backtracking'],
    problems: [
      { id: 'kth-largest-element-in-a-stream',    title: 'Kth Largest Element in a Stream',        difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/' },
      { id: 'last-stone-weight',                  title: 'Last Stone Weight',                      difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/last-stone-weight/' },
      { id: 'k-closest-points-to-origin',         title: 'K Closest Points to Origin',             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
      { id: 'kth-largest-element-in-an-array',    title: 'Kth Largest Element in an Array',        difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { id: 'task-scheduler',                     title: 'Task Scheduler',                         difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/task-scheduler/' },
      { id: 'design-twitter',                     title: 'Design Twitter',                         difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/design-twitter/' },
      { id: 'find-median-from-data-stream',       title: 'Find Median from Data Stream',           difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/' },
    ],
  },
  {
    id: 'graphs',
    label: 'Graphs',
    pos: { left: 266, top: 457 },
    width: 148,
    edges: ['advanced-graphs'],
    prereqs: ['Backtracking'],
    problems: [
      { id: 'number-of-islands',                                    title: 'Number of Islands',                                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
      { id: 'clone-graph',                                          title: 'Clone Graph',                                                    difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/clone-graph/' },
      { id: 'max-area-of-island',                                   title: 'Max Area of Island',                                             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/max-area-of-island/' },
      { id: 'pacific-atlantic-water-flow',                          title: 'Pacific Atlantic Water Flow',                                    difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
      { id: 'surrounded-regions',                                   title: 'Surrounded Regions',                                             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/surrounded-regions/' },
      { id: 'rotting-oranges',                                      title: 'Rotting Oranges',                                                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/' },
      { id: 'walls-and-gates',                                      title: 'Walls and Gates',                                                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/walls-and-gates/' },
      { id: 'course-schedule',                                      title: 'Course Schedule',                                                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule/' },
      { id: 'course-schedule-ii',                                   title: 'Course Schedule II',                                             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/' },
      { id: 'redundant-connection',                                 title: 'Redundant Connection',                                           difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/redundant-connection/' },
      { id: 'number-of-connected-components-in-an-undirected-graph',title: 'Number of Connected Components in an Undirected Graph',         difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
      { id: 'graph-valid-tree',                                     title: 'Graph Valid Tree',                                               difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/' },
      { id: 'word-ladder',                                          title: 'Word Ladder',                                                    difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/word-ladder/' },
    ],
  },
  {
    id: 'dp-1d',
    label: '1-D DP',
    pos: { left: 456, top: 457 },
    width: 148,
    edges: ['dp-2d', 'bit-manipulation'],
    prereqs: ['Backtracking'],
    problems: [
      { id: 'climbing-stairs',                   title: 'Climbing Stairs',                          difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/' },
      { id: 'min-cost-climbing-stairs',           title: 'Min Cost Climbing Stairs',                 difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/min-cost-climbing-stairs/' },
      { id: 'house-robber',                       title: 'House Robber',                             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber/' },
      { id: 'house-robber-ii',                    title: 'House Robber II',                          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/' },
      { id: 'longest-palindromic-substring',      title: 'Longest Palindromic Substring',            difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/' },
      { id: 'palindromic-substrings',             title: 'Palindromic Substrings',                   difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindromic-substrings/' },
      { id: 'decode-ways',                        title: 'Decode Ways',                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/decode-ways/' },
      { id: 'coin-change',                        title: 'Coin Change',                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change/' },
      { id: 'maximum-product-subarray',           title: 'Maximum Product Subarray',                 difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/' },
      { id: 'word-break',                         title: 'Word Break',                               difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-break/' },
      { id: 'longest-increasing-subsequence',     title: 'Longest Increasing Subsequence',           difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
      { id: 'partition-equal-subset-sum',         title: 'Partition Equal Subset Sum',               difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
    ],
  },
  {
    id: 'intervals',
    label: 'Intervals',
    pos: { left: 10, top: 542 },
    width: 110,
    edges: [],
    prereqs: ['Heap / Priority Queue'],
    problems: [
      { id: 'insert-interval',                    title: 'Insert Interval',                          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/insert-interval/' },
      { id: 'merge-intervals',                    title: 'Merge Intervals',                          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
      { id: 'non-overlapping-intervals',          title: 'Non-Overlapping Intervals',                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/' },
      { id: 'meeting-rooms',                      title: 'Meeting Rooms',                            difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms/' },
      { id: 'meeting-rooms-ii',                   title: 'Meeting Rooms II',                         difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/' },
      { id: 'minimum-interval-to-include-each-query', title: 'Minimum Interval to Include Each Query', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/' },
    ],
  },
  {
    id: 'greedy',
    label: 'Greedy',
    pos: { left: 134, top: 542 },
    width: 110,
    edges: [],
    prereqs: ['Heap / Priority Queue'],
    problems: [
      { id: 'maximum-subarray',                       title: 'Maximum Subarray',                          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
      { id: 'jump-game',                              title: 'Jump Game',                                 difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game/' },
      { id: 'jump-game-ii',                           title: 'Jump Game II',                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game-ii/' },
      { id: 'gas-station',                            title: 'Gas Station',                               difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/gas-station/' },
      { id: 'hand-of-straights',                      title: 'Hand of Straights',                         difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/hand-of-straights/' },
      { id: 'merge-triplets-to-form-target-triplet',  title: 'Merge Triplets to Form Target Triplet',     difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/' },
      { id: 'partition-labels',                       title: 'Partition Labels',                          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/partition-labels/' },
      { id: 'valid-parenthesis-string',               title: 'Valid Parenthesis String',                  difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/valid-parenthesis-string/' },
    ],
  },
  {
    id: 'advanced-graphs',
    label: 'Advanced Graphs',
    pos: { left: 258, top: 542 },
    width: 130,
    edges: [],
    prereqs: ['Graphs'],
    problems: [
      { id: 'reconstruct-itinerary',              title: 'Reconstruct Itinerary',                    difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/reconstruct-itinerary/' },
      { id: 'min-cost-to-connect-all-points',     title: 'Min Cost to Connect All Points',           difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/min-cost-to-connect-all-points/' },
      { id: 'network-delay-time',                 title: 'Network Delay Time',                       difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/network-delay-time/' },
      { id: 'swim-in-rising-water',               title: 'Swim in Rising Water',                     difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/' },
      { id: 'alien-dictionary',                   title: 'Alien Dictionary',                         difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/' },
      { id: 'cheapest-flights-within-k-stops',    title: 'Cheapest Flights Within K Stops',          difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/' },
    ],
  },
  {
    id: 'dp-2d',
    label: '2-D DP',
    pos: { left: 403, top: 542 },
    width: 110,
    edges: ['math-geometry'],
    prereqs: ['1-D DP'],
    problems: [
      { id: 'unique-paths',                                   title: 'Unique Paths',                                              difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/' },
      { id: 'longest-common-subsequence',                     title: 'Longest Common Subsequence',                                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/' },
      { id: 'best-time-to-buy-and-sell-stock-with-cooldown', title: 'Best Time to Buy and Sell Stock with Cooldown',             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/' },
      { id: 'coin-change-ii',                                 title: 'Coin Change II',                                            difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change-ii/' },
      { id: 'target-sum',                                     title: 'Target Sum',                                                difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/target-sum/' },
      { id: 'interleaving-string',                            title: 'Interleaving String',                                       difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/interleaving-string/' },
      { id: 'longest-increasing-path-in-a-matrix',           title: 'Longest Increasing Path in a Matrix',                       difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/' },
      { id: 'distinct-subsequences',                          title: 'Distinct Subsequences',                                     difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/distinct-subsequences/' },
      { id: 'edit-distance',                                  title: 'Edit Distance',                                             difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/edit-distance/' },
      { id: 'burst-balloons',                                 title: 'Burst Balloons',                                            difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/burst-balloons/' },
      { id: 'regular-expression-matching',                    title: 'Regular Expression Matching',                               difficulty: 'Hard',   leetcodeUrl: 'https://leetcode.com/problems/regular-expression-matching/' },
    ],
  },
  {
    id: 'bit-manipulation',
    label: 'Bit Manipulation',
    pos: { left: 524, top: 542 },
    width: 130,
    edges: [],
    prereqs: ['1-D DP'],
    problems: [
      { id: 'single-number',           title: 'Single Number',           difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/single-number/' },
      { id: 'number-of-1-bits',        title: 'Number of 1 Bits',        difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/number-of-1-bits/' },
      { id: 'counting-bits',           title: 'Counting Bits',           difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/counting-bits/' },
      { id: 'reverse-bits',            title: 'Reverse Bits',            difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/reverse-bits/' },
      { id: 'missing-number',          title: 'Missing Number',          difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/missing-number/' },
      { id: 'sum-of-two-integers',     title: 'Sum of Two Integers',     difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/sum-of-two-integers/' },
      { id: 'reverse-integer',         title: 'Reverse Integer',         difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reverse-integer/' },
    ],
  },
  {
    id: 'math-geometry',
    label: 'Math & Geometry',
    pos: { left: 373, top: 627 },
    width: 148,
    edges: [],
    prereqs: ['2-D DP'],
    problems: [
      { id: 'rotate-image',        title: 'Rotate Image',        difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/rotate-image/' },
      { id: 'spiral-matrix',       title: 'Spiral Matrix',       difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/' },
      { id: 'set-matrix-zeroes',   title: 'Set Matrix Zeroes',   difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/' },
      { id: 'happy-number',        title: 'Happy Number',        difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/happy-number/' },
      { id: 'plus-one',            title: 'Plus One',            difficulty: 'Easy',   leetcodeUrl: 'https://leetcode.com/problems/plus-one/' },
      { id: 'powx-n',              title: 'Pow(x, n)',           difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/powx-n/' },
      { id: 'multiply-strings',    title: 'Multiply Strings',    difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/multiply-strings/' },
      { id: 'detect-squares',      title: 'Detect Squares',      difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/detect-squares/' },
    ],
  },
]

/** Total problems across all topics (should be 150) */
export const TOTAL_PROBLEMS = TOPICS.reduce((sum, t) => sum + t.problems.length, 0)
```

- [ ] **Step 2: Verify problem count**

Open the browser console at `http://localhost:5173` and run:
```js
import('/src/data/dsaData.js').then(m => console.log('Total:', m.TOTAL_PROBLEMS))
```
Expected output: `Total: 150`

Or count manually: Arrays(9) + TwoPtr(5) + Stack(7) + BinSearch(7) + SlideWin(6) + LinkedList(11) + Trees(15) + Tries(3) + Backtrack(9) + HeapPQ(7) + Graphs(13) + DP1D(12) + Intervals(6) + Greedy(8) + AdvGraphs(6) + DP2D(11) + BitManip(7) + MathGeo(8) = 150 ✓

- [ ] **Step 3: Commit**

```bash
git add frontend/src/data/dsaData.js
git commit -m "feat: add dsaData.js with NeetCode 150 topics and problems"
```

---

## Task 2: Create DsaRoadmapPage.jsx

**Files:**
- Create: `src/pages/DsaRoadmapPage.jsx`

The page has three visual zones:
1. **Nav bar** — "🎯 Roadmap" logo + solved counter + overall progress bar
2. **Graph area** (flex: 1, scrollable) — SVG arrows layer + absolutely-positioned topic nodes
3. **Right panel** (400px, fixed width) — ESC button, topic title, progress, prereqs grid, problem table

The component builds an `arrowLines` array by iterating `TOPICS` → each `edges` entry → computes `(cx_src, bot_src)` → `(cx_dst, top_dst)` using `pos` + `width` + `NODE_HEIGHT = 44`.

- [ ] **Step 1: Create the full component**

`src/pages/DsaRoadmapPage.jsx`:

```jsx
import { useState } from 'react'
import { TOPICS, TOTAL_PROBLEMS } from '../data/dsaData'

const NODE_HEIGHT = 44
const CANVAS_W = 680
const CANVAS_H = 710
const LS_KEY = 'dsa_progress'

// Pre-compute a lookup map: id → topic
const TOPIC_MAP = Object.fromEntries(TOPICS.map(t => [t.id, t]))

// Pre-compute SVG arrow lines from edges
const ARROW_LINES = []
TOPICS.forEach(src => {
  const srcCx = src.pos.left + src.width / 2
  const srcBot = src.pos.top + NODE_HEIGHT
  src.edges.forEach(dstId => {
    const dst = TOPIC_MAP[dstId]
    if (!dst) return
    const dstCx = dst.pos.left + dst.width / 2
    const dstTop = dst.pos.top
    ARROW_LINES.push({ x1: srcCx, y1: srcBot, x2: dstCx, y2: dstTop })
  })
})

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
  catch { return {} }
}

export default function DsaRoadmapPage() {
  const [selectedId, setSelectedId] = useState(null)
  const [progress, setProgress] = useState(loadProgress)

  const selectedTopic = selectedId ? TOPIC_MAP[selectedId] : null
  const totalSolved = Object.keys(progress).length

  function selectTopic(id) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  function toggleProblem(problemId) {
    setProgress(prev => {
      const next = { ...prev }
      if (next[problemId]) delete next[problemId]
      else next[problemId] = true
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }

  const overallPct = TOTAL_PROBLEMS > 0 ? (totalSolved / TOTAL_PROBLEMS) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0d1117', color: '#c9d1d9' }}>

      {/* ── NAV BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '9px 16px', background: '#161b22', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        <span style={{ fontSize: 16 }}>🗺️</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f6fc' }}>DSA Roadmap</span>
        <span style={{ fontSize: 12, color: '#8b949e' }}>NeetCode 150</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#8b949e' }}>{totalSolved} / {TOTAL_PROBLEMS} solved</span>
        <div style={{ width: 120, height: 4, background: '#21262d', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${overallPct}%`, height: '100%', background: '#388bfd', borderRadius: 99, transition: 'width .3s' }} />
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── GRAPH AREA ── */}
        <div style={{ flex: 1, overflow: 'auto', background: '#0d1117', position: 'relative' }}>
          <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, margin: '20px auto' }}>

            {/* SVG arrows */}
            <svg
              style={{ position: 'absolute', inset: 0, width: CANVAS_W, height: CANVAS_H, pointerEvents: 'none' }}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            >
              <defs>
                <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" fill="#3b5bdb" opacity=".75" />
                </marker>
              </defs>
              <g stroke="#3b5bdb" strokeWidth="1.5" fill="none" opacity=".7" markerEnd="url(#arr)">
                {ARROW_LINES.map((ln, i) => (
                  <line key={i} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} />
                ))}
              </g>
            </svg>

            {/* Topic nodes */}
            {TOPICS.map(topic => {
              const solvedCount = topic.problems.filter(p => progress[p.id]).length
              const total = topic.problems.length
              const pct = total > 0 ? (solvedCount / total) * 100 : 0
              const isDone = solvedCount === total && total > 0
              const isSelected = selectedId === topic.id

              let bg = 'linear-gradient(180deg, #1c2d6b 0%, #1a2860 100%)'
              let border = '#2d4ba0'
              let boxShadow = 'none'
              if (isDone) { bg = 'linear-gradient(180deg, #0f3622 0%, #0d2f1d 100%)'; border = '#238636' }
              if (isSelected) { bg = 'linear-gradient(180deg, #1d3d8f 0%, #1a3580 100%)'; border = '#58a6ff'; boxShadow = '0 0 0 3px rgba(88,166,255,.25)' }

              return (
                <div
                  key={topic.id}
                  onClick={() => selectTopic(topic.id)}
                  style={{
                    position: 'absolute',
                    left: topic.pos.left,
                    top: topic.pos.top,
                    width: topic.width,
                    background: bg,
                    border: `1px solid ${border}`,
                    boxShadow,
                    borderRadius: 8,
                    padding: '9px 12px 8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'border-color .15s, box-shadow .15s',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ fontSize: topic.width < 148 ? 10.5 : 11.5, fontWeight: 600, color: '#c9d1d9', whiteSpace: 'nowrap' }}>
                    {topic.label}
                  </div>
                  <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(255,255,255,.4)', borderRadius: 99, transition: 'width .3s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ width: 400, flexShrink: 0, background: '#161b22', borderLeft: '1px solid #21262d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedTopic ? (
            <RightPanel
              topic={selectedTopic}
              progress={progress}
              onClose={() => setSelectedId(null)}
              onToggle={toggleProblem}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#8b949e' }}>
              <div style={{ fontSize: 28 }}>🗺️</div>
              <div style={{ fontSize: 13 }}>Select a topic to see problems</div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function RightPanel({ topic, progress, onClose, onToggle }) {
  const solvedCount = topic.problems.filter(p => progress[p.id]).length
  const total = topic.problems.length
  const pct = total > 0 ? (solvedCount / total) * 100 : 0

  return (
    <>
      {/* Panel header */}
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #21262d', flexShrink: 0, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 700, color: '#8b949e', background: '#21262d', border: '1px solid #30363d', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
        >
          ESC
        </button>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f0f6fc', marginBottom: 4 }}>{topic.label}</div>
        <div style={{ fontSize: 12, color: '#8b949e', textAlign: 'center', marginBottom: 6 }}>({solvedCount} / {total})</div>
        <div style={{ height: 4, background: '#21262d', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#388bfd', borderRadius: 99, transition: 'width .3s' }} />
        </div>
      </div>

      {/* Prerequisites */}
      <div style={{ padding: '10px 18px 12px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>
          Prerequisites
        </div>
        {topic.prereqs.length === 0 ? (
          <div style={{ fontSize: 12, color: '#8b949e', fontStyle: 'italic' }}>None — this is a starting topic</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 6px' }}>
            {topic.prereqs.map(prereq => (
              <div key={prereq} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 13, height: 13, border: '1px solid #30363d', borderRadius: 3, background: '#0d1117', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#c9d1d9' }}>{prereq}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Problem table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '34px 34px 1fr 76px 52px', padding: '7px 12px', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, background: '#161b22', zIndex: 2 }}>
          {['Status', 'Star', 'Problem', 'Difficulty', 'Solution'].map((h, i) => (
            <div key={h} style={{ fontSize: 10.5, fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '.5px', textAlign: i !== 2 ? 'center' : 'left' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {topic.problems.map(prob => {
          const done = !!progress[prob.id]
          const diffColor = prob.difficulty === 'Easy' ? '#3fb950' : prob.difficulty === 'Medium' ? '#d29922' : '#f85149'
          return (
            <div
              key={prob.id}
              style={{ display: 'grid', gridTemplateColumns: '34px 34px 1fr 76px 52px', padding: '8px 12px', borderBottom: '1px solid rgba(33,38,45,.8)', alignItems: 'center', cursor: 'pointer', transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              {/* Checkbox */}
              <div
                onClick={() => onToggle(prob.id)}
                style={{ width: 14, height: 14, border: done ? 'none' : '1px solid #30363d', borderRadius: 3, background: done ? '#238636' : '#0d1117', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                {done && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
              </div>

              {/* Star */}
              <div style={{ textAlign: 'center', fontSize: 13, color: '#e3b341', opacity: .35 }}>★</div>

              {/* Problem name + link */}
              <div style={{ fontSize: 12.5, color: '#c9d1d9', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                <a
                  href={prob.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#c9d1d9', textDecoration: 'none', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#388bfd'}
                  onMouseLeave={e => e.currentTarget.style.color = '#c9d1d9'}
                >
                  {prob.title}
                </a>
                <span style={{ fontSize: 10, color: '#8b949e', flexShrink: 0 }}>↗</span>
              </div>

              {/* Difficulty */}
              <div style={{ fontSize: 11.5, fontWeight: 600, textAlign: 'center', color: diffColor }}>{prob.difficulty}</div>

              {/* Solution placeholder */}
              <div style={{ textAlign: 'center', fontSize: 14, color: '#30363d', cursor: 'pointer' }}>📄</div>
            </div>
          )
        })}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Start the dev server and verify visually**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173/roadmap` in the browser (it will still show ComingSoon — that's expected, App.jsx hasn't been updated yet).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DsaRoadmapPage.jsx
git commit -m "feat: add DsaRoadmapPage with dependency graph and problem table"
```

---

## Task 3: Wire App.jsx

**Files:**
- Modify: `src/App.jsx` (lines 1–5 imports, line 49 route)

- [ ] **Step 1: Add the import**

Open `src/App.jsx`. Add this line after the existing page imports (after line 5):

```js
import DsaRoadmapPage from './pages/DsaRoadmapPage'
```

- [ ] **Step 2: Replace the ComingSoon route**

Find this line (currently line 49):
```jsx
<Route path="/roadmap"   element={<ComingSoon name="DSA Roadmap" />} />
```

Replace with:
```jsx
<Route path="/roadmap"   element={<DsaRoadmapPage />} />
```

- [ ] **Step 3: Verify in the browser**

Navigate to `http://localhost:5173/roadmap`.

Expected:
- Dark background (#0d1117)
- Nav bar with "🗺️ DSA Roadmap" + "NeetCode 150" + "0 / 150 solved" + empty progress bar
- Graph canvas centered with 18 topic nodes in the correct diamond/dependency layout
- Blue SVG arrows connecting nodes
- Right panel shows "🗺️ Select a topic to see problems"
- Clicking "Arrays & Hashing" highlights it with a blue ring and opens the right panel showing 9 problems
- Checking a checkbox shows a green checkmark, updates the progress bar, and persists after page reload
- Clicking a problem title opens the LeetCode URL in a new tab

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat: wire /roadmap route to DsaRoadmapPage"
```
