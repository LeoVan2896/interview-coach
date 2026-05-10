import { useParams, useNavigate } from 'react-router-dom'
import { TOPICS } from '../data/dsaData'

const TOPIC_MAP = Object.fromEntries(TOPICS.map(t => [t.id, t]))

const CONCEPTS = {
  'arrays-hashing': {
    summary: 'Arrays store elements in contiguous memory with O(1) index access. Hash maps store key-value pairs with O(1) average lookup, insert, and delete using a hash function. Together they power the majority of interview problems — when you need to count, group, or look things up fast, reach for a hash map.',
    whenToUse: [
      'Counting element frequencies (character counts, word counts)',
      'Detecting duplicates in O(n) instead of O(n²)',
      'Two-sum style problems — store complements in a map',
      'Grouping elements by a computed key (anagram groups)',
      'Prefix sum + hash map for subarray sum problems',
    ],
    complexity: [
      { op: 'Array index access', time: 'O(1)', space: '' },
      { op: 'Array insert / delete (end)', time: 'O(1)', space: '' },
      { op: 'Array insert / delete (middle)', time: 'O(n)', space: '' },
      { op: 'Hash map get / put / remove', time: 'O(1) avg', space: '' },
      { op: 'Hash map — worst case (all collisions)', time: 'O(n)', space: '' },
    ],
    code: `// Frequency counter pattern
function topKFrequent(nums, k) {
  const freq = new Map()
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1)

  // Bucket sort by frequency — O(n) instead of O(n log n)
  const buckets = Array.from({ length: nums.length + 1 }, () => [])
  for (const [num, count] of freq) buckets[count].push(num)

  const result = []
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--)
    result.push(...buckets[i])
  return result
}`,
    patterns: [
      { name: 'Frequency Counter', signal: 'Store element counts in a Map when you need to know how many times each value appears. Classic for anagram checks and top-K problems.', example: 'Top K Frequent Elements' },
      { name: 'Two-Sum Complement', signal: 'Store seen values in a Set/Map; for each element check if its complement already exists. Turns O(n²) brute force into O(n).', example: 'Two Sum' },
      { name: 'Prefix Sum', signal: 'Precompute cumulative sums so any subarray sum is O(1). Combine with a Map to find subarrays summing to a target.', example: 'Product of Array Except Self' },
      { name: 'Grouping by Key', signal: 'Compute a canonical key for each element (sorted string for anagrams, remainder for divisibility) and group into a Map of arrays.', example: 'Group Anagrams' },
    ],
  },

  'two-pointers': {
    summary: 'Use two index variables that move toward each other or in the same direction to eliminate a nested loop. Works on sorted arrays or when the problem asks you to compare, shrink, or expand a pair of boundaries. The key insight: a brute-force O(n²) pair search becomes O(n) when you can decide which pointer to advance based on the current state.',
    whenToUse: [
      'Pair sum in a sorted array — advance left or right based on comparison',
      'Removing duplicates in-place from a sorted array',
      'Palindrome check — inward pointers comparing characters',
      'Container with Most Water — always move the shorter wall',
      'Merging two sorted arrays in-place',
    ],
    complexity: [
      { op: 'Single pass (both pointers traverse array once)', time: 'O(n)', space: '' },
      { op: 'Space (in-place, no auxiliary structure)', time: '', space: 'O(1)' },
    ],
    code: `// 3Sum — sort first, then fix one pointer and two-pointer the rest
function threeSum(nums) {
  nums.sort((a, b) => a - b)
  const result = []

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue  // skip duplicates

    let l = i + 1, r = nums.length - 1
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r]
      if (sum === 0) {
        result.push([nums[i], nums[l], nums[r]])
        while (l < r && nums[l] === nums[l + 1]) l++
        while (l < r && nums[r] === nums[r - 1]) r--
        l++; r--
      } else if (sum < 0) l++
      else r--
    }
  }
  return result
}`,
    patterns: [
      { name: 'Inward Pointers', signal: 'Start one pointer at each end of a sorted array; advance the smaller/left or retreat the larger/right based on the current sum vs target.', example: 'Two Sum II - Input Array Is Sorted' },
      { name: 'Duplicate Skip', signal: 'After recording a result, advance the pointer past all identical values to avoid duplicate triplets/pairs.', example: '3Sum' },
      { name: 'Shrink the Smaller Wall', signal: 'In optimization problems with two boundaries, always move the side that limits the result — moving the taller wall can\'t improve it.', example: 'Container With Most Water' },
    ],
  },

  'stack': {
    summary: 'A LIFO (Last In, First Out) structure with O(1) push and pop. The key pattern: a stack tracks pending state that needs to be resolved by a future element — like matching open brackets waiting for their close, or smaller bars waiting for a taller bar to determine their span. Monotonic stacks maintain a sorted order and are used for next-greater-element problems.',
    whenToUse: [
      'Matching / validating bracket pairs',
      'Next greater / smaller element (monotonic stack)',
      'Evaluating expressions (Reverse Polish Notation)',
      'DFS iteratively instead of recursion',
      'Largest rectangle in histogram — track indices of increasing bars',
    ],
    complexity: [
      { op: 'Push', time: 'O(1)', space: '' },
      { op: 'Pop', time: 'O(1)', space: '' },
      { op: 'Peek (top)', time: 'O(1)', space: '' },
      { op: 'Monotonic stack pass over array', time: 'O(n)', space: 'O(n)' },
    ],
    code: `// Daily Temperatures — monotonic decreasing stack of indices
function dailyTemperatures(temps) {
  const result = new Array(temps.length).fill(0)
  const stack = []  // stores indices of unresolved days

  for (let i = 0; i < temps.length; i++) {
    // Pop every day that is colder than today
    while (stack.length && temps[i] > temps[stack.at(-1)]) {
      const idx = stack.pop()
      result[idx] = i - idx
    }
    stack.push(i)
  }
  return result
}`,
    patterns: [
      { name: 'Pending Match', signal: 'Push open elements onto the stack; when a closing element arrives, pop and verify the match.', example: 'Valid Parentheses' },
      { name: 'Monotonic Decreasing Stack', signal: 'Maintain indices of elements in decreasing order; when a larger element arrives, pop everything smaller — each popped element has found its "next greater".', example: 'Daily Temperatures' },
      { name: 'Previous Smaller / Span', signal: 'Stack of indices where each pop reveals the previous smaller element, enabling O(1) span or rectangle area calculations.', example: 'Largest Rectangle in Histogram' },
    ],
  },

  'binary-search': {
    summary: 'Halves the search space each step by comparing against the midpoint. Requires the input to be sorted OR for the answer space to be monotonic (valid on one side, invalid on the other). The advanced form — "binary search on the answer" — lets you solve optimization problems by asking "is X a valid answer?" and binary searching for the boundary.',
    whenToUse: [
      'Find a target in a sorted array in O(log n)',
      'First/last position of a value (left/right boundary variants)',
      'Rotated sorted array — determine which half is sorted',
      'Minimize/maximize a value with a monotonic feasibility check',
      'Koko eating bananas, capacity to ship — binary search on the answer',
    ],
    complexity: [
      { op: 'Search in sorted array', time: 'O(log n)', space: 'O(1)' },
      { op: 'Binary search on answer space', time: 'O(log(range) × check)', space: 'O(1)' },
    ],
    code: `// Binary search on the answer — Koko Eating Bananas
function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles)

  while (lo < hi) {
    const mid = (lo + hi) >> 1
    // Can Koko finish all piles at speed mid within h hours?
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0)
    if (hours <= h) hi = mid   // mid works, try slower
    else lo = mid + 1          // too slow, need faster
  }
  return lo
}`,
    patterns: [
      { name: 'Classic Left/Right Boundary', signal: 'Use lo < hi with hi = mid or lo = mid + 1 depending on whether mid is a valid candidate. Avoids off-by-one errors.', example: 'Find Minimum in Rotated Sorted Array' },
      { name: 'Binary Search on Answer', signal: 'When the answer is a value in a range and feasibility is monotonic, binary search the answer space and check feasibility at each midpoint.', example: 'Koko Eating Bananas' },
      { name: 'Which Half is Sorted?', signal: 'In a rotated array, one half is always sorted. Use that to decide which half the target lives in.', example: 'Search in Rotated Sorted Array' },
    ],
  },

  'sliding-window': {
    summary: 'Maintain a contiguous window of elements using two pointers. The right pointer expands the window to include new elements; the left pointer shrinks it when a constraint is violated. This converts an O(n²) nested loop into an O(n) single pass because each element enters and leaves the window at most once.',
    whenToUse: [
      'Longest substring without repeating characters',
      'Minimum window substring containing all required characters',
      'Fixed-size window — maximum sum subarray of size k',
      'At-most K distinct characters in a window',
      'Permutation in string — fixed-size sliding window with frequency map',
    ],
    complexity: [
      { op: 'Variable window single pass', time: 'O(n)', space: 'O(k) for window state' },
      { op: 'Fixed window single pass', time: 'O(n)', space: 'O(1) or O(k)' },
    ],
    code: `// Longest substring without repeating characters
function lengthOfLongestSubstring(s) {
  const seen = new Map()  // char → last index
  let best = 0, left = 0

  for (let right = 0; right < s.length; right++) {
    const c = s[right]
    // If we've seen this char inside the window, shrink from the left
    if (seen.has(c) && seen.get(c) >= left) left = seen.get(c) + 1
    seen.set(c, right)
    best = Math.max(best, right - left + 1)
  }
  return best
}`,
    patterns: [
      { name: 'Variable Window — Expand/Shrink', signal: 'Right pointer expands; when a constraint is violated, advance left until valid again. Each element enters and exits the window at most once → O(n).', example: 'Longest Substring Without Repeating Characters' },
      { name: 'Fixed Window', signal: 'Slide a window of size k: add the new right element, remove the element that fell off the left.', example: 'Best Time to Buy and Sell Stock' },
      { name: 'Frequency Map Window', signal: 'Track character counts inside the window with a Map; shrink when a count exceeds the limit or when required characters are satisfied.', example: 'Minimum Window Substring' },
    ],
  },

  'linked-list': {
    summary: 'Nodes connected by pointers — no random access, but O(1) insert and delete at a known position. The two canonical techniques are the runner (fast/slow pointers) for cycle detection and finding the midpoint, and pointer reversal for in-place list manipulation. Always draw the pointer changes on paper before coding.',
    whenToUse: [
      'Detect a cycle — fast pointer laps slow pointer inside a cycle',
      'Find midpoint — slow reaches mid when fast reaches end',
      'Reverse a list or a sublist in-place',
      'Merge K sorted lists — use a min-heap on list heads',
      'LRU Cache — doubly linked list + hash map for O(1) get/put',
    ],
    complexity: [
      { op: 'Access by index', time: 'O(n)', space: '' },
      { op: 'Insert / delete at known node', time: 'O(1)', space: '' },
      { op: 'Search', time: 'O(n)', space: '' },
      { op: 'Reverse entire list', time: 'O(n)', space: 'O(1)' },
    ],
    code: `// Reverse a linked list — iterative pointer reversal
function reverseList(head) {
  let prev = null, curr = head

  while (curr) {
    const next = curr.next  // save before overwriting
    curr.next = prev        // reverse the pointer
    prev = curr             // advance prev
    curr = next             // advance curr
  }
  return prev  // prev is the new head
}`,
    patterns: [
      { name: 'Fast / Slow Pointers', signal: 'Move one pointer twice as fast. They meet inside a cycle (cycle detection) or slow reaches midpoint when fast reaches end (find middle).', example: 'Linked List Cycle' },
      { name: 'Pointer Reversal', signal: 'Track prev, curr, next; redirect curr.next = prev each step. Draw the state after each step before coding.', example: 'Reverse Linked List' },
      { name: 'Dummy Head Node', signal: 'Prepend a dummy node to avoid special-casing operations on the head. Return dummy.next at the end.', example: 'Merge Two Sorted Lists' },
      { name: 'Two-Pointer Gap', signal: 'Advance one pointer N steps ahead; then move both together. When the leader hits the end, the follower is at the target.', example: 'Remove Nth Node From End of List' },
    ],
  },

  'trees': {
    summary: 'Hierarchical structure where each node has at most two children. DFS (pre/in/post-order) and BFS are the two traversal families — choose BFS for level-order or shortest-path questions, DFS for path sums and subtree problems. BSTs maintain sorted order: in-order traversal of a BST yields elements in ascending sequence.',
    whenToUse: [
      'Validate or reconstruct a BST — use in-order property',
      'Path sum problems — DFS passing accumulated value down',
      'Level-order traversal — BFS with a queue',
      'Lowest Common Ancestor — recurse and check subtree membership',
      'Serialize / deserialize — pre-order DFS with null markers',
    ],
    complexity: [
      { op: 'BST insert / search (balanced)', time: 'O(log n)', space: '' },
      { op: 'BST insert / search (skewed)', time: 'O(n)', space: '' },
      { op: 'DFS traversal', time: 'O(n)', space: 'O(h) call stack' },
      { op: 'BFS traversal', time: 'O(n)', space: 'O(w) queue (w = max width)' },
    ],
    code: `// Maximum path sum — track global max through recursive return
function maxPathSum(root) {
  let globalMax = -Infinity

  function dfs(node) {
    if (!node) return 0
    // Ignore negative contributions — take 0 instead
    const left = Math.max(0, dfs(node.left))
    const right = Math.max(0, dfs(node.right))
    // Path through this node as the "peak"
    globalMax = Math.max(globalMax, node.val + left + right)
    // Return the best single branch upward
    return node.val + Math.max(left, right)
  }

  dfs(root)
  return globalMax
}`,
    patterns: [
      { name: 'DFS Return Value', signal: 'Each recursive call returns something useful (max depth, path sum, subtree size). The parent combines left and right results.', example: 'Maximum Depth of Binary Tree' },
      { name: 'Global Variable + DFS', signal: 'Some answers (diameter, max path sum) span both subtrees and can\'t be returned up. Update a let best variable inside the DFS instead.', example: 'Binary Tree Maximum Path Sum' },
      { name: 'BFS Level Order', signal: 'Use a queue; at each level record queue.length before processing to know exactly how many nodes are in the current level.', example: 'Binary Tree Level Order Traversal' },
      { name: 'In-Order = Sorted', signal: 'In-order traversal of a BST visits nodes in ascending order. Use this to validate, find kth smallest, or convert BST to sorted array.', example: 'Kth Smallest Element in a BST' },
    ],
  },

  'tries': {
    summary: 'A prefix tree where each path from root to node spells a string prefix. Each node branches up to 26 times (one per letter). Enables O(m) insert and prefix search (m = word length) — faster than a hash set for prefix queries. The TrieNode typically holds a children map and an isEnd flag.',
    whenToUse: [
      'Autocomplete — collect all words with a given prefix',
      'Word search in a 2D grid — prune branches early with a trie',
      'Design Add and Search Words with wildcards (DFS on trie)',
      'Longest word built character by character',
      'IP routing / longest prefix matching',
    ],
    complexity: [
      { op: 'Insert word of length m', time: 'O(m)', space: 'O(m) new nodes' },
      { op: 'Search / startsWith', time: 'O(m)', space: 'O(1)' },
      { op: 'Space for n words of avg length m', time: '', space: 'O(n × m) worst case' },
    ],
    code: `class TrieNode {
  constructor() {
    this.children = {}
    this.isEnd = false
  }
}

class Trie {
  constructor() { this.root = new TrieNode() }

  insert(word) {
    let node = this.root
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode()
      node = node.children[ch]
    }
    node.isEnd = true
  }

  startsWith(prefix) {
    let node = this.root
    for (const ch of prefix) {
      if (!node.children[ch]) return false
      node = node.children[ch]
    }
    return true
  }
}`,
    patterns: [
      { name: 'TrieNode with children Map', signal: 'Each node holds children = {} and isEnd = false. Walk character by character; create nodes as needed on insert.', example: 'Implement Trie (Prefix Tree)' },
      { name: 'Prefix Pruning in DFS', signal: 'When searching a grid for words, check if the current path prefix exists in the trie before continuing. Prunes dead branches early.', example: 'Word Search II' },
      { name: 'Wildcard Match with DFS', signal: 'On a "." character, recurse into all children of the current node. On a letter, follow the specific child.', example: 'Design Add and Search Words Data Structure' },
    ],
  },

  'backtracking': {
    summary: 'Systematically explore all possibilities by building a candidate solution incrementally, then "undoing" the last choice when a path cannot lead to a valid answer. Think of it as DFS on an implicit decision tree. Pruning — skipping branches you know are invalid — is the key to making it fast in practice.',
    whenToUse: [
      'Generate all subsets, permutations, or combinations',
      'Constraint satisfaction — N-Queens, Sudoku solver',
      'Word search in a grid — DFS + visited set',
      'Palindrome partitioning — try every split point',
      'Letter combinations of a phone number',
    ],
    complexity: [
      { op: 'Subsets (choose / not choose each element)', time: 'O(2ⁿ)', space: 'O(n) call stack' },
      { op: 'Permutations', time: 'O(n!)', space: 'O(n)' },
      { op: 'Combinations C(n,k)', time: 'O(C(n,k) × k)', space: 'O(k)' },
    ],
    code: `// Subsets — choose or skip each element
function subsets(nums) {
  const result = []

  function backtrack(start, current) {
    result.push([...current])  // snapshot current state

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i])        // choose
      backtrack(i + 1, current)    // explore
      current.pop()                // undo (backtrack)
    }
  }

  backtrack(0, [])
  return result
}`,
    patterns: [
      { name: 'Choose / Explore / Undo', signal: 'Push a choice, recurse, then pop it. The undo step is what separates backtracking from plain DFS.', example: 'Subsets' },
      { name: 'Start Index to Avoid Reuse', signal: 'Pass a start index into each recursive call; only iterate from start onward to prevent using the same element twice.', example: 'Combination Sum' },
      { name: 'Constraint Check Before Recurse', signal: 'Validate the current partial solution before going deeper. Early rejection prunes entire subtrees.', example: 'N-Queens' },
      { name: 'Duplicate Skip in Sorted Input', signal: 'Sort first; skip nums[i] === nums[i-1] when i > start to avoid generating duplicate results.', example: 'Combination Sum II' },
    ],
  },

  'heap-pq': {
    summary: 'A complete binary tree that maintains the heap property: the min (or max) element is always at the root, accessible in O(1). Insert and extract cost O(log n) because they bubble up or down through the tree height. JavaScript lacks a built-in heap — simulate with a sorted array or use a library; in interviews, describe the operations and their complexities.',
    whenToUse: [
      'Top-K elements — push all, keep heap size ≤ k',
      'Merge K sorted lists — min-heap on list heads',
      'Find median from a data stream — two heaps (max-heap left, min-heap right)',
      'Task scheduling — process highest-priority task next',
      'Dijkstra\'s shortest path — min-heap on (distance, node)',
    ],
    complexity: [
      { op: 'Peek (min or max)', time: 'O(1)', space: '' },
      { op: 'Insert', time: 'O(log n)', space: '' },
      { op: 'Extract min / max', time: 'O(log n)', space: '' },
      { op: 'Build heap from array', time: 'O(n)', space: 'O(1)' },
    ],
    code: `// K Closest Points to Origin — max-heap of size k
// (JavaScript: simulate min-heap with negated distances)
function kClosest(points, k) {
  // Sort approach for clarity — O(n log n)
  return points
    .sort((a, b) => (a[0]**2 + a[1]**2) - (b[0]**2 + b[1]**2))
    .slice(0, k)
}

// Heap approach (O(n log k)) — conceptually:
// 1. Push each point's distance onto a MAX-heap of size k
// 2. If heap size > k, pop the farthest
// 3. Remaining k elements are the closest`,
    patterns: [
      { name: 'Keep Top-K with Min-Heap', signal: 'Push each element into a min-heap; if size exceeds k, pop the minimum (discards the smallest). The k elements remaining are the k largest. O(n log k).', example: 'Top K Frequent Elements' },
      { name: 'Two-Heap Split', signal: 'A max-heap for the lower half and a min-heap for the upper half. Rebalance after each insert so sizes differ by at most 1. Median = top of the larger heap.', example: 'Find Median from Data Stream' },
      { name: 'Merge K Sorted with Min-Heap', signal: 'Push the head of each list into a min-heap keyed by value. Pop minimum, push its successor. Runs in O(n log k).', example: 'Merge K Sorted Lists' },
    ],
  },

  'graphs': {
    summary: 'A set of nodes (vertices) connected by edges. BFS visits nodes level by level and finds the shortest path in an unweighted graph. DFS explores as deep as possible and suits connected-component or cycle detection. Union-Find (disjoint set) efficiently merges components and checks connectivity in near-O(1) per operation.',
    whenToUse: [
      'Connected components — DFS/BFS flood fill',
      'Shortest path (unweighted) — BFS from source',
      'Cycle detection — DFS with a "visiting" state, or Union-Find',
      'Topological sort — Kahn\'s algorithm (BFS) or DFS post-order',
      'Bipartite check — 2-color BFS/DFS',
    ],
    complexity: [
      { op: 'BFS / DFS', time: 'O(V + E)', space: 'O(V)' },
      { op: 'Union-Find (path compression + union by rank)', time: 'O(α(n)) ≈ O(1)', space: 'O(V)' },
      { op: 'Topological sort', time: 'O(V + E)', space: 'O(V)' },
    ],
    code: `// Number of Islands — BFS flood fill
function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length
  let count = 0

  function bfs(r, c) {
    const queue = [[r, c]]
    grid[r][c] = '0'  // mark visited in-place
    while (queue.length) {
      const [row, col] = queue.shift()
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = row + dr, nc = col + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1') {
          grid[nr][nc] = '0'
          queue.push([nr, nc])
        }
      }
    }
  }

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === '1') { bfs(r, c); count++ }

  return count
}`,
    patterns: [
      { name: 'BFS for Shortest Path', signal: 'In an unweighted graph, BFS guarantees the first time you reach a node is via the shortest path. Track visited before pushing to the queue.', example: 'Rotting Oranges' },
      { name: 'DFS Flood Fill', signal: 'Mark a cell visited, then recurse into all valid neighbors. Used for connected components and island counting.', example: 'Number of Islands' },
      { name: 'Union-Find for Connectivity', signal: 'find(x) with path compression + union(x, y) by rank. Check find(a) === find(b) to test connectivity in near-O(1).', example: 'Number of Connected Components in an Undirected Graph' },
      { name: 'Topological Sort (Kahn\'s)', signal: 'Build in-degree counts. Push all zero-in-degree nodes into a queue. Process queue: decrement neighbors\' in-degrees, push newly-zero ones.', example: 'Course Schedule' },
    ],
  },

  'dp-1d': {
    summary: 'Dynamic programming breaks a problem into overlapping subproblems and caches results to avoid recomputation. 1D DP uses a single array where dp[i] is derived from one or more earlier entries. The two approaches — top-down memoization (recursive + cache) and bottom-up tabulation (iterative) — produce the same result; tabulation is usually preferred in interviews for its clarity.',
    whenToUse: [
      'Fibonacci-style recurrences — climbing stairs, house robber',
      'Coin change — minimum coins to reach a target',
      'Longest increasing subsequence — O(n log n) with patience sort',
      'Word break — can a string be segmented using a dictionary',
      'Partition equal subset sum — knapsack variant',
    ],
    complexity: [
      { op: 'Typical 1D DP', time: 'O(n)', space: 'O(n) table or O(1) with rolling vars' },
      { op: 'Coin change (amount × coins)', time: 'O(n × m)', space: 'O(n)' },
      { op: 'Longest increasing subsequence', time: 'O(n log n)', space: 'O(n)' },
    ],
    code: `// House Robber — can't rob adjacent houses
function rob(nums) {
  // dp[i] = max money robbing houses 0..i
  // dp[i] = max(dp[i-1],  nums[i] + dp[i-2])
  //         skip i        rob i
  let prev2 = 0, prev1 = 0

  for (const n of nums) {
    const curr = Math.max(prev1, n + prev2)
    prev2 = prev1
    prev1 = curr
  }
  return prev1
}`,
    patterns: [
      { name: 'Define dp[i] Clearly', signal: 'State the exact meaning of dp[i] in one sentence before writing any code. The recurrence follows directly from the definition.', example: 'Climbing Stairs' },
      { name: 'Two-Variable Rolling', signal: 'When dp[i] only depends on dp[i-1] and dp[i-2], replace the array with two variables to get O(1) space.', example: 'House Robber' },
      { name: 'Unbounded Knapsack', signal: 'Iterate the coin/item array in the outer loop and amounts in the inner loop. The direction of the inner loop controls whether items can repeat.', example: 'Coin Change' },
    ],
  },

  'intervals': {
    summary: 'Sort intervals by start time, then make a single greedy pass comparing the current interval\'s start against the previous end. The sorted order guarantees you only ever need to look at one "active" interval at a time. Most interval problems reduce to: merge overlapping ones, count simultaneous overlaps (meeting rooms), or find gaps.',
    whenToUse: [
      'Merge overlapping intervals — O(n log n)',
      'Meeting Rooms II — count peak simultaneous meetings (min-heap)',
      'Insert interval into a sorted list — handle 3 cases: before, overlap, after',
      'Non-overlapping intervals — greedily keep the interval with the earliest end',
      'Minimum interval covering each query — offline sort + heap',
    ],
    complexity: [
      { op: 'Sort by start time', time: 'O(n log n)', space: '' },
      { op: 'Merge / scan pass', time: 'O(n)', space: 'O(n) output' },
      { op: 'Meeting Rooms II (min-heap)', time: 'O(n log n)', space: 'O(n)' },
    ],
    code: `// Merge Intervals
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0])
  const result = [intervals[0]]

  for (let i = 1; i < intervals.length; i++) {
    const last = result.at(-1)
    const [start, end] = intervals[i]

    if (start <= last[1]) {
      // Overlaps — extend the previous interval's end
      last[1] = Math.max(last[1], end)
    } else {
      result.push([start, end])
    }
  }
  return result
}`,
    patterns: [
      { name: 'Sort then Sweep', signal: 'Sort by start time; compare each interval\'s start against the previous result\'s end. Overlap: extend end. No overlap: append.', example: 'Merge Intervals' },
      { name: 'Three-Case Insert', signal: 'When inserting into a sorted list: (1) new interval ends before current starts → insert before; (2) overlaps → merge; (3) new interval starts after current ends → keep current.', example: 'Insert Interval' },
      { name: 'Min-Heap for Active Intervals', signal: 'Push end times into a min-heap. For each new interval, if its start > heap top, pop (meeting ended). Heap size = peak simultaneous intervals.', example: 'Meeting Rooms II' },
    ],
  },

  'greedy': {
    summary: 'Make the locally optimal choice at each step and trust that it leads to a global optimum. A greedy approach is valid when the problem has the "greedy-choice property" — choosing the best option now never prevents a better total outcome. Proof by exchange argument: assume the greedy choice is wrong, show swapping it with the "optimal" choice cannot improve the result.',
    whenToUse: [
      'Jump Game — track the farthest reachable index at each step',
      'Gas Station — if total gas ≥ total cost, a valid start exists',
      'Partition Labels — greedily extend the current partition to cover all occurrences',
      'Task Scheduler — always schedule the most frequent remaining task',
      'Merge Triplets — greedily select triplets that don\'t exceed the target',
    ],
    complexity: [
      { op: 'Typical greedy (single pass)', time: 'O(n)', space: 'O(1)' },
      { op: 'With sorting', time: 'O(n log n)', space: 'O(1)' },
    ],
    code: `// Jump Game II — minimum jumps to reach the end
function jump(nums) {
  let jumps = 0, currEnd = 0, farthest = 0

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i])

    if (i === currEnd) {
      // We've exhausted the reach of the current jump
      // — must take another jump to reach 'farthest'
      jumps++
      currEnd = farthest
    }
  }
  return jumps
}`,
    patterns: [
      { name: 'Track Reachability', signal: 'Instead of simulating each jump, track the farthest index reachable from any position seen so far. If current index > farthest, return false.', example: 'Jump Game' },
      { name: 'Greedy by Earliest End', signal: 'To maximize the number of non-overlapping intervals, always keep the interval with the earliest end time — it leaves maximum room for the rest.', example: 'Non-overlapping Intervals' },
      { name: 'Extend Current Partition', signal: 'Track the last occurrence of each character; greedily extend the current partition\'s boundary whenever a character\'s last occurrence is beyond it.', example: 'Partition Labels' },
    ],
  },

  'advanced-graphs': {
    summary: 'Weighted graph algorithms extend BFS with a priority queue (Dijkstra) or relax all edges repeatedly (Bellman-Ford). Minimum spanning tree algorithms (Kruskal, Prim) find the lowest-cost tree connecting all nodes. Eulerian path problems ask for a route that visits every edge exactly once — solvable with Hierholzer\'s algorithm.',
    whenToUse: [
      'Shortest path in a weighted graph — Dijkstra (non-negative weights)',
      'Shortest path with negative edges — Bellman-Ford',
      'Minimum spanning tree — Kruskal (sort edges + Union-Find) or Prim (min-heap)',
      'Reconstruct itinerary — Eulerian path with Hierholzer\'s DFS',
      'Alien dictionary / order inference — topological sort',
    ],
    complexity: [
      { op: 'Dijkstra (binary heap)', time: 'O((V + E) log V)', space: 'O(V)' },
      { op: 'Bellman-Ford', time: 'O(V × E)', space: 'O(V)' },
      { op: 'Kruskal MST', time: 'O(E log E)', space: 'O(V)' },
      { op: 'Prim MST (binary heap)', time: 'O((V + E) log V)', space: 'O(V)' },
    ],
    code: `// Dijkstra's shortest path (min-heap simulation)
function networkDelayTime(times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => [])
  for (const [u, v, w] of times) graph[u].push([v, w])

  const dist = new Array(n + 1).fill(Infinity)
  dist[k] = 0
  // Min-heap: [distance, node] — use a sorted array to simulate
  const heap = [[0, k]]

  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0])          // real solution: use MinHeap
    const [d, u] = heap.shift()
    if (d > dist[u]) continue                  // stale entry

    for (const [v, w] of graph[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
        heap.push([dist[v], v])
      }
    }
  }

  const max = Math.max(...dist.slice(1))
  return max === Infinity ? -1 : max
}`,
    patterns: [
      { name: 'Dijkstra = BFS + Priority Queue', signal: 'Replace BFS\'s queue with a min-heap keyed by cumulative distance. Skip stale entries with: if d > dist[u] continue.', example: 'Network Delay Time' },
      { name: 'Kruskal = Sort Edges + Union-Find', signal: 'Sort all edges by weight; add an edge only if its two endpoints are in different components (Union-Find check).', example: 'Min Cost to Connect All Points' },
      { name: 'Topological Sort for Order Problems', signal: 'Build a directed graph from ordering constraints; Kahn\'s BFS or DFS post-order gives a valid sequence (or detects a cycle).', example: 'Alien Dictionary' },
    ],
  },

  'dp-2d': {
    summary: '2D DP uses a table where dp[i][j] represents the answer to a subproblem defined by two parameters — typically two positions in two strings, or a row/column in a grid. Space can usually be reduced from O(m×n) to O(n) by only keeping the current and previous rows, since each cell only depends on adjacent cells.',
    whenToUse: [
      'Longest Common Subsequence — two strings, dp[i][j] = LCS of s1[0..i] and s2[0..j]',
      'Edit Distance — transform one string into another with min operations',
      'Unique Paths — count paths in a grid',
      'Coin Change II — number of ways (unbounded knapsack)',
      'Best Time to Buy/Sell Stock with Cooldown — states: hold, sold, rest',
    ],
    complexity: [
      { op: 'Standard 2D DP (m×n table)', time: 'O(m × n)', space: 'O(m × n)' },
      { op: 'Space-optimized (rolling row)', time: 'O(m × n)', space: 'O(n)' },
    ],
    code: `// Longest Common Subsequence
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length
  // dp[i][j] = LCS length for text1[0..i-1] and text2[0..j-1]
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1     // characters match — extend
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])  // skip one char
      }
    }
  }
  return dp[m][n]
}`,
    patterns: [
      { name: 'Index Both Strings', signal: 'dp[i][j] represents the answer for s1[0..i-1] and s2[0..j-1]. Base cases: empty string = 0 operations / 0 length.', example: 'Longest Common Subsequence' },
      { name: 'Match or Skip', signal: 'If characters match: extend from dp[i-1][j-1]. If not: take the best of skipping one character from either string.', example: 'Edit Distance' },
      { name: 'Rolling Row Optimization', signal: 'dp[i][j] only depends on the row above and the cell to the left. Replace the 2D table with a single 1D array updated in-place.', example: 'Coin Change II' },
    ],
  },

  'bit-manipulation': {
    summary: 'Operate directly on the binary representation of integers. XOR (^) is the most interview-useful operator: a ^ a = 0 (self-cancels) and a ^ 0 = a (identity). AND (&) masks bits; OR (|) sets bits; left/right shifts multiply or divide by powers of 2. Bit tricks eliminate branching and extra space in many classic problems.',
    whenToUse: [
      'Find the single non-duplicate — XOR all numbers, duplicates cancel',
      'Count set bits — Brian Kernighan: n &= (n - 1) clears the lowest set bit',
      'Check power of 2 — n > 0 && (n & (n - 1)) === 0',
      'Sum without + operator — use XOR for bits and AND<<1 for carry',
      'Bitmask DP — represent subsets as integers (efficient for n ≤ 20)',
    ],
    complexity: [
      { op: 'Any bitwise operation', time: 'O(1)', space: 'O(1)' },
      { op: 'Count set bits (Kernighan)', time: 'O(k) — k = number of set bits', space: 'O(1)' },
      { op: 'Iterate all subsets of n bits', time: 'O(2ⁿ)', space: 'O(1)' },
    ],
    code: `// Single Number — XOR cancels all duplicates
function singleNumber(nums) {
  return nums.reduce((acc, n) => acc ^ n, 0)
}

// Number of 1 Bits — Brian Kernighan's algorithm
function hammingWeight(n) {
  let count = 0
  while (n !== 0) {
    n &= n - 1   // clears the lowest set bit each iteration
    count++
  }
  return count
}

// Sum of Two Integers — no + operator
function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1   // carry bits
    a = a ^ b                     // sum without carry
    b = carry
  }
  return a
}`,
    patterns: [
      { name: 'XOR Self-Cancellation', signal: 'XOR all elements; duplicates cancel to 0, the unique element remains. Works because a ^ a = 0 and a ^ 0 = a.', example: 'Single Number' },
      { name: 'Clear Lowest Set Bit', signal: 'n &= (n - 1) removes the rightmost 1-bit. Loop count = number of set bits.', example: 'Number of 1 Bits' },
      { name: 'Isolate / Check Bit', signal: '(n >> i) & 1 reads bit i. n | (1 << i) sets it. n & ~(1 << i) clears it.', example: 'Reverse Bits' },
      { name: 'Bitmask for Subsets', signal: 'Represent a subset of n elements as an integer 0 to 2ⁿ-1. Bit i is set if element i is included. Iterate all subsets in O(2ⁿ).', example: 'Counting Bits' },
    ],
  },

  'math-geometry': {
    summary: 'A catch-all for problems involving number theory, matrix manipulation, or coordinate geometry. Key patterns: rotate a matrix by transposing then reversing rows; simulate spiral traversal with boundary shrinking; use modular arithmetic to handle large numbers; apply fast exponentiation (O(log n)) instead of repeated multiplication.',
    whenToUse: [
      'Rotate Image — transpose then reverse each row in-place',
      'Spiral Matrix — maintain and shrink four boundaries',
      'Happy Number — cycle detection (Floyd\'s) on the digit-square sequence',
      'Pow(x, n) — fast exponentiation: x^n = (x^(n/2))^2',
      'Multiply Strings — grade-school multiplication on digit arrays',
    ],
    complexity: [
      { op: 'Matrix rotation (n×n)', time: 'O(n²)', space: 'O(1) in-place' },
      { op: 'Spiral traversal', time: 'O(n²)', space: 'O(1)' },
      { op: 'Fast exponentiation', time: 'O(log n)', space: 'O(log n) recursive' },
    ],
    code: `// Rotate Image 90° clockwise — transpose then reverse rows
function rotate(matrix) {
  const n = matrix.length

  // Step 1: Transpose (flip across main diagonal)
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]]

  // Step 2: Reverse each row
  for (let i = 0; i < n; i++)
    matrix[i].reverse()
}

// Fast exponentiation — O(log n)
function myPow(x, n) {
  if (n < 0) { x = 1 / x; n = -n }
  let result = 1
  while (n > 0) {
    if (n & 1) result *= x   // odd exponent — multiply in current x
    x *= x                    // square x
    n >>= 1                   // halve exponent
  }
  return result
}`,
    patterns: [
      { name: 'Transpose + Reverse = Rotate', signal: 'To rotate a matrix 90° clockwise: transpose (swap [i][j] with [j][i]), then reverse each row. Counterclockwise: reverse rows first, then transpose.', example: 'Rotate Image' },
      { name: 'Shrinking Boundaries for Spiral', signal: 'Maintain top, bottom, left, right boundary pointers; after processing each side, move the corresponding boundary inward.', example: 'Spiral Matrix' },
      { name: 'Fast Exponentiation', signal: 'x^n = (x^(n/2))² for even n, x × x^(n-1) for odd n. Halves the exponent each step → O(log n).', example: 'Pow(x, n)' },
    ],
  },
}

export default function DsaConceptPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const topic = TOPIC_MAP[topicId]
  const concept = CONCEPTS[topicId]

  if (!topic || !concept) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8b949e', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 32 }}>🤔</div>
        <div>Concept not found for topic: {topicId}</div>
        <button onClick={() => navigate('/roadmap')} style={backBtnStyle}>← Back to Roadmap</button>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0d1117', color: '#c9d1d9' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Back button */}
        <button onClick={() => navigate('/roadmap')} style={backBtnStyle}>
          ← Back to Roadmap
        </button>

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0f6fc', margin: '20px 0 8px' }}>
          {topic.label}
        </h1>
        <div style={{ width: 48, height: 3, background: '#388bfd', borderRadius: 99, marginBottom: 28 }} />

        {/* Summary */}
        <Section title="Overview">
          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: '#c9d1d9', margin: 0 }}>{concept.summary}</p>
        </Section>

        {/* When to Use */}
        <Section title="When to Use">
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {concept.whenToUse.map((item, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: '#c9d1d9' }}>{item}</li>
            ))}
          </ul>
        </Section>

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

        {/* Complexity Table */}
        <Section title="Time & Space Complexity">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#161b22' }}>
                <th style={thStyle}>Operation</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Space</th>
              </tr>
            </thead>
            <tbody>
              {concept.complexity.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#0d1117' : '#161b22' }}>
                  <td style={tdStyle}>{row.op}</td>
                  <td style={{ ...tdStyle, color: '#3fb950', fontFamily: 'monospace', textAlign: 'center' }}>{row.time || '—'}</td>
                  <td style={{ ...tdStyle, color: '#d29922', fontFamily: 'monospace', textAlign: 'center' }}>{row.space || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Code Example */}
        <Section title="Code Example">
          <pre style={{
            background: '#161b22',
            border: '1px solid #21262d',
            borderRadius: 8,
            padding: '20px 22px',
            overflowX: 'auto',
            fontSize: 13,
            lineHeight: 1.65,
            color: '#c9d1d9',
            margin: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}>
            <code>{concept.code}</code>
          </pre>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 14, marginTop: 0 }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

const backBtnStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#8b949e',
  background: '#21262d',
  border: '1px solid #30363d',
  borderRadius: 6,
  padding: '6px 12px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

const thStyle = {
  padding: '8px 14px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#8b949e',
  textTransform: 'uppercase',
  letterSpacing: '.5px',
  border: '1px solid #21262d',
}

const tdStyle = {
  padding: '9px 14px',
  border: '1px solid #21262d',
  color: '#c9d1d9',
  fontSize: 13,
}
