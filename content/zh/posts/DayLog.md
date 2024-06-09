---
title: 日记
date: 2024-06-03
draft: true
---
### 2024-06-09
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

