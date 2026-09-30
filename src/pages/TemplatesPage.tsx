import { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const TEMPLATES = [
  {
    category: 'Sorting',
    items: [
      {
        name: 'Quick Sort',
        useCase: 'General-purpose in-place sorting',
        time: 'O(n log n) average, O(n²) worst',
        space: 'O(log n)',
        code: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i+1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
      },
      {
        name: 'Merge Sort',
        useCase: 'Stable sort, counting inversions',
        time: 'O(n log n)',
        space: 'O(n)',
        code: `void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> left(arr.begin()+l, arr.begin()+m+1);
    vector<int> right(arr.begin()+m+1, arr.begin()+r+1);
    int i = 0, j = 0, k = l;
    while (i < left.size() && j < right.size())
        arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m+1, r);
        merge(arr, l, m, r);
    }
}`,
      },
    ],
  },
  {
    category: 'Binary Search',
    items: [
      {
        name: 'Binary Search (Iterative)',
        useCase: 'Search in sorted array',
        time: 'O(log n)',
        space: 'O(1)',
        code: `int binarySearch(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
      },
      {
        name: 'Lower / Upper Bound',
        useCase: 'Find first/last occurrence, answer on range',
        time: 'O(log n)',
        space: 'O(1)',
        code: `// Lower bound: first position >= target
int lowerBound(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo; // arr[lo] >= target
}

// Upper bound: first position > target
int upperBound(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] <= target) lo = mid + 1;
        else hi = mid;
    }
    return lo; // arr[lo] > target
}`,
      },
    ],
  },
  {
    category: 'Two Pointers / Sliding Window',
    items: [
      {
        name: 'Two Pointers (Sorted Array)',
        useCase: 'Pair sum, container with most water',
        time: 'O(n)',
        space: 'O(1)',
        code: `// Find pair with target sum in sorted array
bool twoSum(vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l < r) {
        int sum = arr[l] + arr[r];
        if (sum == target) return true;
        if (sum < target) l++;
        else r--;
    }
    return false;
}`,
      },
      {
        name: 'Sliding Window (Variable Size)',
        useCase: 'Longest subarray with constraint',
        time: 'O(n)',
        space: 'O(1)',
        code: `// Longest subarray with sum <= k
int longestSubarray(vector<int>& arr, int k) {
    int left = 0, maxLen = 0;
    long long sum = 0;
    for (int right = 0; right < arr.size(); right++) {
        sum += arr[right];
        while (sum > k && left <= right) {
            sum -= arr[left++];
        }
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      },
    ],
  },
  {
    category: 'Linked List',
    items: [
      {
        name: 'Reverse Linked List',
        useCase: 'In-place reversal',
        time: 'O(n)',
        space: 'O(1)',
        code: `ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      },
      {
        name: 'Detect Cycle (Floyd\'s)',
        useCase: 'Detect cycle in linked list',
        time: 'O(n)',
        space: 'O(1)',
        code: `bool hasCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
      },
    ],
  },
  {
    category: 'Dynamic Programming',
    items: [
      {
        name: '0/1 Knapsack',
        useCase: 'Subset selection with weight constraint',
        time: 'O(n*W)',
        space: 'O(n*W)',
        code: `int knapsack(vector<int>& weights, vector<int>& values, int W) {
    int n = weights.size();
    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i-1][w]; // don't pick
            if (weights[i-1] <= w)
                dp[i][w] = max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1]);
        }
    }
    return dp[n][W];
}`,
      },
      {
        name: 'LCS (Longest Common Subsequence)',
        useCase: 'String matching, edit distance',
        time: 'O(m*n)',
        space: 'O(m*n)',
        code: `int lcs(string& s1, string& s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i-1] == s2[j-1])
                dp[i][j] = dp[i-1][j-1] + 1;
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}`,
      },
    ],
  },
  {
    category: 'Graph',
    items: [
      {
        name: 'BFS',
        useCase: 'Shortest path in unweighted graph, level order',
        time: 'O(V+E)',
        space: 'O(V)',
        code: `void bfs(int start, vector<vector<int>>& adj) {
    int n = adj.size();
    vector<bool> visited(n, false);
    queue<int> q;
    q.push(start);
    visited[start] = true;
    while (!q.empty()) {
        int node = q.front(); q.pop();
        cout << node << " ";
        for (int neighbor : adj[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
}`,
      },
      {
        name: 'DFS',
        useCase: 'Cycle detection, topological sort, connected components',
        time: 'O(V+E)',
        space: 'O(V)',
        code: `void dfs(int node, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[node] = true;
    cout << node << " ";
    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            dfs(neighbor, adj, visited);
        }
    }
}`,
      },
      {
        name: "Dijkstra's Algorithm",
        useCase: 'Shortest path in weighted graph (non-negative edges)',
        time: 'O((V+E) log V)',
        space: 'O(V)',
        code: `vector<int> dijkstra(int src, vector<vector<pair<int,int>>>& adj, int n) {
    vector<int> dist(n, INT_MAX);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    dist[src] = 0;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
      },
    ],
  },
  {
    category: 'Trees',
    items: [
      {
        name: 'Tree Traversals',
        useCase: 'Inorder, preorder, postorder',
        time: 'O(n)',
        space: 'O(h)',
        code: `// Inorder: left, root, right
void inorder(TreeNode* root, vector<int>& res) {
    if (!root) return;
    inorder(root->left, res);
    res.push_back(root->val);
    inorder(root->right, res);
}

// Preorder: root, left, right
void preorder(TreeNode* root, vector<int>& res) {
    if (!root) return;
    res.push_back(root->val);
    preorder(root->left, res);
    preorder(root->right, res);
}

// Postorder: left, right, root
void postorder(TreeNode* root, vector<int>& res) {
    if (!root) return;
    postorder(root->left, res);
    postorder(root->right, res);
    res.push_back(root->val);
}`,
      },
      {
        name: 'Level Order BFS',
        useCase: 'Level-by-level traversal',
        time: 'O(n)',
        space: 'O(n)',
        code: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        vector<int> level;
        for (int i = 0; i < sz; i++) {
            auto node = q.front(); q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        res.push_back(level);
    }
    return res;
}`,
      },
    ],
  },
  {
    category: 'Bit Manipulation',
    items: [
      {
        name: 'Common Bit Tricks',
        useCase: 'Fast bitwise operations',
        time: 'O(1)',
        space: 'O(1)',
        code: `// Check if ith bit is set
bool isSet(int n, int i) { return (n >> i) & 1; }

// Set ith bit
int setBit(int n, int i) { return n | (1 << i); }

// Clear ith bit
int clearBit(int n, int i) { return n & ~(1 << i); }

// Toggle ith bit
int toggleBit(int n, int i) { return n ^ (1 << i); }

// Count set bits (Brian Kernighan)
int countBits(int n) {
    int cnt = 0;
    while (n) { n &= (n - 1); cnt++; }
    return cnt;
}

// Power of 2 check
bool isPowerOf2(int n) { return n > 0 && (n & (n-1)) == 0; }`,
      },
    ],
  },
];



export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">C++ Templates & Patterns</h1>
        <p className="text-dark-400 text-sm mt-1">
          Reusable code templates for DSA problems with complexity analysis
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !activeCategory ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200'
          }`}
        >
          All
        </button>
        {TEMPLATES.map((t) => (
          <button
            key={t.category}
            onClick={() => setActiveCategory(t.category === activeCategory ? null : t.category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === t.category ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200'
            }`}
          >
            {t.category}
          </button>
        ))}
      </div>

      {/* Templates */}
      <div className="space-y-6">
        {TEMPLATES.filter((t) => !activeCategory || t.category === activeCategory).map((cat) => (
          <div key={cat.category}>
            <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-dark-800">
              {cat.category}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cat.items.map((t) => (
                <div key={t.name} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                      <p className="text-xs text-dark-400 mt-0.5">{t.useCase}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4">
                    <div>
                      <div className="text-xs text-dark-500">Time</div>
                      <div className="text-xs font-mono text-brand-300">{t.time}</div>
                    </div>
                    <div>
                      <div className="text-xs text-dark-500">Space</div>
                      <div className="text-xs font-mono text-purple-300">{t.space}</div>
                    </div>
                  </div>
                  <CodeBlock code={t.code} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
