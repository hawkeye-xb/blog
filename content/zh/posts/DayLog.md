---
title: 日记
date: 2024-06-03
draft: true
---
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

