# Example: Two Sum (LeetCode #1)
# Problem URL: https://leetcode.com/problems/two-sum/

def twoSum(nums, target):
    """
    Find two numbers in nums that add up to target.
    Return indices of the two numbers.
    """
    map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in map:
            return [map[complement], i]
        map[num] = i
    return []

