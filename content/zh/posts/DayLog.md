---
title: 日记
date: 2024-06-03
draft: true
weight: 1
---
### 2024-06-12
#### [121. 买卖股票的最佳时机 - 简单](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
今天刚从十渡出来，还收拾搬家东西，略忙。把简单题给刷了，这个题很好想，除了暴力以外，在观察下，遍历过的数据段中，里面的最小值到里面的最大值之间的差就是最大的，后续如果出现更小值和更大值，他们之间的差会更大，如果只出现最小值，不一定会有更大的差值。

用个例子说明更直接：`[7,5,3,4,6,1,2]`。
- 最大差肯定出现在最小值和后面的最大值之中。
- 最大的段时[3,4,6]
- 后续出现了更小值1, 但无更大值了
- 如果后续增加元素8，[7,5,3,4,6,1,2,8]
- 则满足最前面的条件，[1,8]


```ts
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    let highestPrice = 0;
    let minValue = Infinity;
    for(let i = 0; i < prices.length; i++) {
        if (prices[i] < minValue) {
            minValue = prices[i];
        } else {
            highestPrice = Math.max(highestPrice, (prices[i] - minValue));
        }
    }

    return highestPrice;
};
```
#### [394. 字符串解码](https://leetcode.cn/problems/decode-string/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
用栈就好了。
```ts
/**
 * @param {string} s
 * @return {string}
 */
var decodeString = function(s) {
    const stack = [];
    for (let i = 0; i < s.length; i++) {
        if (s[i] === ']') {
            let str = '';

            let popVal = stack.pop();
            while(stack.length > 0 && popVal !== '[') {
                str = popVal + str;
                popVal = stack.pop();
            }

            if (popVal === '[') {
                let numStrPopVal = '';
                while (
                    stack.length > 0
                    && !isNaN(
                        stack[stack.length - 1]
                    )
                ) { // 栈顶是数字字符
                    numStrPopVal = stack.pop() + numStrPopVal;
                }
                let repushStr = '';
                for (let j = 0; j < Number(numStrPopVal); j ++) {
                    repushStr = repushStr + str;
                }
                stack.push(repushStr);
            }
        } else {
            stack.push(s[i]);
        }
    }

    let res = '';
    while (stack.length > 0) {
        res = stack.pop() + res;
    }

    return res;
};
```
### 2024-06-11
#### [143. 重排链表](https://leetcode.cn/problems/reorder-list/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
想到用线性表存储所有节点，按照双指针的移动重构链表。空间复杂度O(n)，时间复杂度O(2n)。
也想到了快慢找中点，翻转后合并。时间也是O(kn)，定义指针的空间O(1)。
结果在比划比划的，突发奇想用了个双向链表。空间复杂度O(n)，时间复杂度O(2n)。
```ts
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {void} Do not return anything, modify head in-place instead.
 */
var reorderList = function(head) {
    let newHead = head;
    while (newHead.next) {
        const next = newHead.next;
        if (next) {
            next.prev = newHead;
        }
        newHead = newHead.next;
    }
    let newTail = newHead; // 找到尾节点，同时给所有节点增加prev指针
    newHead = head;

    let headToTail = true;
    while (newHead.next && newTail.prev) {
        if (headToTail) {
            const oldNext = newHead.next;
            newHead.next = newTail;
            oldNext.prev = null; // 成为新头
            newHead = oldNext;
        } else {
            const oldPrev = newTail.prev;
            newTail.next = newHead;
            newTail.prev = null;
            oldPrev.next = null;
            newTail = oldPrev;
        }
        headToTail = !headToTail;
    }

    return head;
};
```
#### [503. 下一个更大元素 II](https://leetcode.cn/problems/next-greater-element-ii/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
单调栈的应用。

（暴力）最简单直观，对于每个元素，我们都循环去查找下一个最大值。最不理想的情况下时间复杂度O(n^2)。

在这个循环中，意味着更大的元素有可能出现在前面，最好能够“回头找”，并且直接的逻辑思路就是拿着当前的元素去找下个值。

如果有个结构，能让我们存储`index = i`到找到下个最大值`index = j`之间的所有元素，那么出现在中间的元素，它们的下个最大，肯定是`index = j`的这个元素。
再分成一段段来看，`i ... j`之间，如果有再次满足上面这个条件的`i + x1 ... j - x2`， `j - x2`是这个区间的所有元素下个最大值，它们找到了归宿。

就能免去`i ... j`，`i - 1 ... j`等之间很多重复的对比。     

这个结构很自然而然的，就可以想到了栈，并且是自发形成的单调栈，最小的在栈顶。

这道题因为最后的值压栈之后，只能循环对比，线性的增长nums即可。
```ts
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var nextGreaterElements = function(nums) {
    const n = nums.length;
    const stack = [];
    const result = new Array(n).fill(-1);
    for(let i = 0; i < n * 2; i++) {
        while (
            stack.length > 0 // 出栈的前提
            && nums[i % n] > nums[
                stack[ stack.length - 1 ] // 栈顶的index
            ] // 栈顶的值
        ) {
            // 当前值比栈顶值大，说明栈顶index的下一个最大值是当前值
            result[stack.pop()] = nums[i % n];
        }

        stack.push(i % n) // 存index
    }

    return result;
};

```

### 2024-06-10
#### [78. 子集](https://leetcode.cn/problems/subsets/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
想到用回溯方法，但写不出来，最后连暴力都懒得写了，就参考了题解。
```ts
function subsets(nums: number[]): number[][] {
    const res = [];
    function backtrack(start, path) {
        res.push([ ...path ]);
        for(let i = start; i < nums.length; i++) {
            path.push(nums[i]);
            backtrack(i +1, path);
            path.pop();
        }
    }

    backtrack(0, []);
    return res;
};
```
这种题同时让我想起了之前的全排列，没有用回溯的办法。这里重新写了一遍。
#### [46. 全排列](https://leetcode.cn/problems/permutations/?company_slug=bytedance)
这里不需要缩减个数，push的时机也不一样。
```ts
function permute(nums: number[]): number[][] {
    // 需要快速判断没有使用的
    const used = new Array(nums.length).fill(false);
    const res = [];

    const backtrack = function(path) {
        if (path.length === nums.length) {
            res.push([ ...path ]);
            return;
        }

        for(let i = 0; i < nums.length; i++) {
            if (!used[i]) {
                path.push(nums[i]);
                used[i] = true;
                backtrack(path);
                used[i] = false;
                path.pop();
            }
        }
    }
    backtrack([]);
    
    return res;
};
```
#### [47. 全排列 II](https://leetcode.cn/problems/permutations-ii/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
全排列2会出现重复的内容，想的是利用排序logn，再判断前一个元素是否一致来跳过重复项。
```ts
function permuteUnique(nums: number[]): number[][] {
    nums = nums.sort((a, b) => a - b);

    const used = new Array(nums.length).fill(false);
    const res = [];
    const backtrack = function(path) {
        if (path.length === nums.length) {
            res.push([ ...path ]);
            return;
        }

        let lastpop = null;
        for(let i = 0; i < nums.length; i ++) {
            // 相同的必须跳过
            if (nums[i] === lastpop) continue;
            if (path.length === 0 && i > 0 && nums[i] === nums[i - 1]) continue;
            if (!used[i]) {
                used[i] = true;
                path.push(nums[i]);
                backtrack(path);
                lastpop = path.pop();
                used[i] = false;
            }
        }
    }

    backtrack([]);
    return res;
};
```

### 2024-06-09
#### [LCR 070. 有序数组中的单一元素](https://leetcode.cn/problems/skFtm2/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
第一解：用了双指针。O(n)的复杂度。

也想到了二分，看的题解，确实是可以通判断mid值的两侧来确认解的范围。不断缩小范围，题解的`nums[mid ^ 1]` 这行代码非常惊艳，如果 mid 是偶数，mid ^ 1 就是 mid + 1；如果 mid 是奇数，mid ^ 1 就是 mid - 1。
```ts
function singleNonDuplicate(nums: number[]): number {
    let low = 0; let high = nums.length - 1;
    while (low < high) {
        const mid = Math.floor((high - low) / 2) + low;
        // console.log('mid: ', mid);
        /*
        如果 mid 是偶数，mid ^ 1 就是 mid + 1；
        如果 mid 是奇数，mid ^ 1 就是 mid - 1。
        这样做的目的是检查 mid 位置的元素是否与其邻居（左边或右边）的元素相同。
        */ 
        if (nums[mid] === nums[mid ^ 1]) {
            low = mid + 1;
        } else {
            high = mid;
        }
        // console.info(low, high)
    }

    return nums[low];
};
```
#### [142. 环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)

之前用hash表记录的方式实现过，对于要求使用O(1)空间，最直接想到的就是快慢指针了，这次也是，在ptr为什么等于相遇后慢指针走到环首存在推理疑问。

终于是断断续续的搞明白了。
##### ptr指针能和show指针相遇在环首节点
假设：
- 快节点是慢节点的2倍步长
- head到环首节点距离为A
- 环首节点到快慢指针相遇点的距离为B
- 相遇节点重新回到环首节点，环剩余的距离为C
- 相遇后ptr以1步长开始走

也就是有结论：
- 环长度：B + C
- 慢指针在相遇时候走过的长度：A + B
- 快指针在相遇时候走过的是：A + B + n(B + C)；n圈

得到公式：2倍慢指针走过的长度 = 快指针走过的长度   
`2(A + B) = A + B + n(B + C)`    
`A + B = n(B + C)`    
`A = n(B + C) - B`    
下一步确实是没想到的    
`A = (n - 1)(B + C) + C`    
到这里，可能会陷入圈数想不明白。其实圈数不要紧，几圈都可以，可以假设`n = 1`，慢指针不用绕圈就能和ptr在环首节点相遇`A = 0*(B + C) + C`，或者`A`距离更长，`n > 1`。也没有太大关系，慢指针在绕圈之后，也还是出现在同样的地方。也就满足了`A = C`。

##### 慢指针为什么没绕圈
假设是同时出发，最晚能在慢指针绕半圈的时候，快指针能套圈慢指针。    
假设快指针慢一步，则下一步就追上了。   
同理，落到这个区间的范围内，慢指针走过更少的步数，快指针就能追上。   
因为是2倍步数，不会出现套圈后跳过慢指针的情况。

```ts
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function detectCycle(head: ListNode | null): ListNode | null {
    if (head === null) return null;

    let showPointer = head;
    let fastPointer = head;

    while (fastPointer !== null) {
        if (
            showPointer?.next === null
            || fastPointer?.next === null
            || fastPointer?.next?.next === null
        ) {
            return null;
        }
        showPointer = showPointer?.next;
        fastPointer = fastPointer?.next?.next;

        if (showPointer === fastPointer) {
            let ptr = head;
            while (ptr !== showPointer) {
                ptr = ptr.next;
                showPointer = showPointer.next;
            }
            return ptr;
        }
    }

    return null;
};
```

### 2024-06-08
#### [LCR 010. 和为 K 的子数组](https://leetcode.cn/problems/QTMn0o/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
又刷到这个题了。

#### [全排列 II](https://leetcode.cn/problems/permutations-ii/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
```ts
function permuteUnique(nums: number[]): number[][] {
    if (nums.length === 1) return [nums];

    const set = new Set();
    const all = [];
    for (let i = 0; i < nums.length; i++) {
        const value = nums[i];
        if (set.has(value)) continue;

        set.add(value);
        permuteUnique(
            nums.filter((el, index) => index !== i)
        ).forEach(el => {
            all.push([value].concat(el));
        })
    }

    return all;
};
```

今天复习了会儿，想着在院子里帮忙干会儿活，顺便休息休息。结果刚出来没多会儿，有三蹦子duang！—— 的撞我的03车屁股上来了，我还以为是三蹦子爆胎了，隔着好几十米呢。结果也顾不上腿伤，这三蹦子就要跑，啊，给我气的，撒开丫子就冲过去。

### 2024-06-07
#### [有序数组的平方](https://leetcode.cn/problems/squares-of-a-sorted-array/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint).

一开始想的是普通的平方后排序，当然不能这么写了，想了下对比排序，可以用双指针处理。一开始用的 unshift 插入，但是每次调用 unshift 时，数组中的所有元素都需要向右移动一个位置。reverse只用执行一次即可。
```ts
function sortedSquares(nums: number[]): number[] {
    let startPointer = 0;
    let endPointer = nums.length -1;
    const res = [];
    while (startPointer <= endPointer) {
        if (nums[startPointer] *nums[startPointer] > nums[endPointer] *nums[endPointer]) {
            res.push(nums[startPointer] *nums[startPointer]);
            startPointer++;
        } else {
            res.push(nums[endPointer] *nums[endPointer]);
            endPointer--;
        }
    }
    return res.reverse();
};
```

#### [缺失的第一个正数](https://leetcode.cn/problems/first-missing-positive/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)。

最直接能想到的就是从1开始，遍历这个数组有没有，这样的复杂度O(n)，在`[1,2,3]`需要输出4的情况下，还有常量空间这个条件，突然整蒙了。但后来转念想了下，即使是最不理想的情况，需要输出`nums.length + 1`这个值，它所需要的空间是固定的，符合常量空间要求，直接申请这些大小的空间就好了。如果该数出现，则将空间对应的index标记不为空，这个过程O(n)，再从头寻找第一个没被标记的索引，输出即可，也是O(n)。
```ts
function firstMissingPositive(nums: number[]): number {
    let leng = nums.length;
    const markNums = new Array(leng);
    for(let i = 0; i < nums.length; i ++) {
        if (0 < nums[i] && nums[i] < leng + 1) {
            markNums[
                nums[i] -1 // index
            ] = 1;
        }
    }

    for(let i = 0; i < leng; i ++) {
        if (markNums[i] === undefined) return i + 1;
    }

    return leng + 1;
};
```

### 2024-06-06
#### [单词替换](https://leetcode.cn/problems/replace-words/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)
没考虑有更短的词根(root)。

#### [二叉树最大宽度](https://leetcode.cn/problems/maximum-width-of-binary-tree/description/?envType=study-plan-v2&envId=bytedance-2023-spring-sprint)。

考察bfs、dfs，这几种都可以。担心都是一侧节点，会导致index数据有问题。
```ts
/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

function widthOfBinaryTree(root: TreeNode | null): number {
    // find second
    let waitForCheck = [root];
    let maxWidth = 1;
    while (waitForCheck.length === 1) {
        const node = waitForCheck.shift();

        node?.left && waitForCheck.push(node.left);
        node?.right && waitForCheck.push(node.right);
    }

    if (waitForCheck.length === 2) {
        // 肯定要2个才启动计算
        waitForCheck[0].val = 2;
        waitForCheck[1].val = 3;
    }

    while (waitForCheck.length > 0) {
        const currLevelWidth = (waitForCheck[waitForCheck.length -1].val - waitForCheck[0].val) +1;
        maxWidth = Math.max(maxWidth, currLevelWidth);

        const newWaitForCheck = [];
        waitForCheck.forEach((el) => {
            if (el?.left) {
                el.left.val = el.val *2;
                newWaitForCheck.push(el.left);
            }
            if (el?.right) {
                el.right.val = el.val *2 +1;
                newWaitForCheck.push(el.right);
            }
        })
        
        waitForCheck = newWaitForCheck;
    }

    return maxWidth;
};
```

#### [和为K的连续子数组](https://leetcode.cn/problems/subarray-sum-equals-k/description/?company_slug=bytedance)。
暴力n方的方法解了。前缀和的方法怎么证明？
证明：
因为是连续子数组，当当前`nums[i]`缀和减去k目标`prefixSum - k`，曾经出现过，假设出现的和索引是`nums[j]`的时候（i > j）。

交换可以得到`nums[i]的prefixSum - nums[j]的prefixSum = k`，即`i`到`j`的子数组，为目标数组，又因`j`之前可能存在`k`，使得`i`可以得到的子数组是`j`的子数组+1，所以`count += map.get(prefixSum - k); // 增加计数，使用map中已有的计数`(example: 3,4,7,-4,-3,0)。

并且首个值可以是目标值，设置默认0，出现一次的`(0, 1)`前缀值。
```ts
function subarraySum(nums: number[], k: number): number {
    let count = 0;
    const map = new Map();
    let prefixSum = 0;
    map.set(0, 1); // 初始化，表示前缀和为0的情况已经出现过一次

    for (let i = 0; i < nums.length; i++) {
        prefixSum += nums[i]; // 更新前缀和
        if (map.has(prefixSum - k)) {
            count += map.get(prefixSum - k); // 增加计数，使用map中已有的计数
        }
        
        map.set(prefixSum, (map.get(prefixSum) || 0) + 1);
        // console.log('after set:', map.get(prefixSum));
    }

    return count;
};
```

### 2024-06-05
#### [岛屿数量](https://leetcode.cn/problems/number-of-islands/description/)
虽然性能不怎么样，但是。。都不用改代码，直接使用昨天的。

找设计朋友确认了下色盘生成规范，这个过程有个对比值的计算，可能有的地方需要人工蒙层调色板，做得最好的是[字节的DSM](https://semi.design/dsm/landing)。后续可以研究这个颜色的生成方式。

简单的梳理关于http的发展。
### 2024-06-04
#### [岛屿的最大面积](https://leetcode.cn/problems/ZL6zAn/description/)
```ts
function maxAreaOfIsland(grid: number[][]): number {
    const areaSizeList = [];
    for (let y = 0; y < grid.length; y++) {
        const xlist = grid[y];
        for (let x = 0; x < xlist.length; x++) {
            const areaSize = culPositionAreaSize(y, x);
            if (areaSize > 0) areaSizeList.push(areaSize);
        }
    }

    function culPositionAreaSize(y, x) {
        let positionValue;
        try {
            positionValue = grid[y][x];
        } catch (e) {
            // 越界返回0
            return 0;
        }
        if (positionValue === 1) {
            let sizeCounter = 1;
            grid[y][x] = -1;
            // 检查上下左右
            const topSize = culPositionAreaSize(y - 1, x);
            const rightSize = culPositionAreaSize(y, x + 1);
            const bottomSize = culPositionAreaSize(y + 1, x);
            const leftSize = culPositionAreaSize(y, x - 1);
            sizeCounter = sizeCounter + topSize + rightSize + bottomSize + leftSize;

            return sizeCounter;
        }

        return 0;
    }

    return areaSizeList.length > 0 ? Math.max(...areaSizeList) : 0;
};
```

