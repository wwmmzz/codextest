import type { Problem } from '../types/problem'

export const baseProblems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    functionName: 'twoSum',
    timeLimitMs: 1000,
    memoryLimitBytes: 16 * 1024 * 1024,
    statement:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution, and you may not use the same element twice.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] equals 9.',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Exactly one valid answer exists for every test case.',
    ],
    starterCode:
      'function twoSum(nums, target) {\n  // Write your solution here\n}\n',
    visibleTests: [
      {
        id: 'two-sum-visible-1',
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        description: 'Basic pair at the beginning.',
      },
      {
        id: 'two-sum-visible-2',
        input: [[3, 2, 4], 6],
        expected: [1, 2],
      },
    ],
    hiddenTests: [
      {
        id: 'two-sum-hidden-1',
        input: [[3, 3], 6],
        expected: [0, 1],
      },
      {
        id: 'two-sum-hidden-2',
        input: [[-1, -2, -3, -4, -5], -8],
        expected: [2, 4],
      },
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    functionName: 'isValid',
    timeLimitMs: 1000,
    memoryLimitBytes: 16 * 1024 * 1024,
    statement:
      'Given a string s containing only parentheses characters, determine if the input string is valid. Open brackets must be closed by the same type of brackets and in the correct order.',
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "([)]"',
        output: 'false',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists only of characters: (, ), {, }, [, ].',
    ],
    starterCode:
      'function isValid(s) {\n  // Write your solution here\n}\n',
    visibleTests: [
      {
        id: 'valid-parentheses-visible-1',
        input: ['()'],
        expected: true,
      },
      {
        id: 'valid-parentheses-visible-2',
        input: ['()[]{}'],
        expected: true,
      },
      {
        id: 'valid-parentheses-visible-3',
        input: ['(]'],
        expected: false,
      },
    ],
    hiddenTests: [
      {
        id: 'valid-parentheses-hidden-1',
        input: ['([)]'],
        expected: false,
      },
      {
        id: 'valid-parentheses-hidden-2',
        input: ['{[]}'],
        expected: true,
      },
    ],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    functionName: 'search',
    timeLimitMs: 1000,
    memoryLimitBytes: 16 * 1024 * 1024,
    statement:
      'Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return -1. The algorithm should run in O(log n) time.',
    examples: [
      {
        input: 'nums = [-1,0,3,5,9,12], target = 9',
        output: '4',
      },
      {
        input: 'nums = [-1,0,3,5,9,12], target = 2',
        output: '-1',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All integers in nums are unique.',
      'nums is sorted in ascending order.',
    ],
    starterCode:
      'function search(nums, target) {\n  // Write your solution here\n}\n',
    visibleTests: [
      {
        id: 'binary-search-visible-1',
        input: [[-1, 0, 3, 5, 9, 12], 9],
        expected: 4,
      },
      {
        id: 'binary-search-visible-2',
        input: [[-1, 0, 3, 5, 9, 12], 2],
        expected: -1,
      },
    ],
    hiddenTests: [
      {
        id: 'binary-search-hidden-1',
        input: [[5], 5],
        expected: 0,
      },
      {
        id: 'binary-search-hidden-2',
        input: [[1, 3, 5, 7, 9], 8],
        expected: -1,
      },
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    tags: ['Two Pointers', 'String'],
    functionName: 'reverseString',
    timeLimitMs: 1000,
    memoryLimitBytes: 16 * 1024 * 1024,
    statement:
      'Write a function that reverses a string represented as an array of single-character strings. Return the reversed array.',
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ASCII character.',
    ],
    starterCode:
      'function reverseString(s) {\n  // Write your solution here\n}\n',
    visibleTests: [
      {
        id: 'reverse-string-visible-1',
        input: [['h', 'e', 'l', 'l', 'o']],
        expected: ['o', 'l', 'l', 'e', 'h'],
      },
      {
        id: 'reverse-string-visible-2',
        input: [['H', 'a', 'n', 'n', 'a', 'h']],
        expected: ['h', 'a', 'n', 'n', 'a', 'H'],
      },
    ],
    hiddenTests: [
      {
        id: 'reverse-string-hidden-1',
        input: [['a']],
        expected: ['a'],
      },
      {
        id: 'reverse-string-hidden-2',
        input: [['1', '2', '3', '4']],
        expected: ['4', '3', '2', '1'],
      },
    ],
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Math'],
    functionName: 'climbStairs',
    timeLimitMs: 1000,
    memoryLimitBytes: 16 * 1024 * 1024,
    statement:
      'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb either 1 or 2 steps. Return the number of distinct ways to climb to the top.',
    examples: [
      {
        input: 'n = 2',
        output: '2',
      },
      {
        input: 'n = 3',
        output: '3',
      },
    ],
    constraints: ['1 <= n <= 45'],
    starterCode:
      'function climbStairs(n) {\n  // Write your solution here\n}\n',
    visibleTests: [
      {
        id: 'climbing-stairs-visible-1',
        input: [2],
        expected: 2,
      },
      {
        id: 'climbing-stairs-visible-2',
        input: [3],
        expected: 3,
      },
    ],
    hiddenTests: [
      {
        id: 'climbing-stairs-hidden-1',
        input: [1],
        expected: 1,
      },
      {
        id: 'climbing-stairs-hidden-2',
        input: [10],
        expected: 89,
      },
      {
        id: 'climbing-stairs-hidden-3',
        input: [45],
        expected: 1836311903,
      },
    ],
  },
]
