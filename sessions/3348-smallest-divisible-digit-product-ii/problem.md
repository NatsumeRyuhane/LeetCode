# 3348 — Smallest Divisible Digit Product II

- **Source:** https://leetcode.cn/problems/smallest-divisible-digit-product-ii/
- **Difficulty:** Hard
- **Daily question:** 2026-08-07
- **Sibling:** [3345 — Smallest Divisible Digit Product I](../3345-smallest-divisible-digit-product-i/) (solved 2026-08-06)

## Statement

You are given a string `num` which represents a positive integer, and an integer `t`.

A number is called **zero-free** if none of its digits are 0.

Return a string representing the smallest **zero-free** number greater than or equal
to `num` such that the product of its digits is divisible by `t`. If no such number
exists, return `"-1"`.

### Example 1

```
Input:  num = "1234", t = 256
Output: "1488"
```
The smallest zero-free number that is greater than 1234 and has the product of its
digits divisible by 256 is 1488, with the product of its digits equal to 256.

### Example 2

```
Input:  num = "12355", t = 50
Output: "12355"
```
12355 is already zero-free and has the product of its digits divisible by 50, with
the product of its digits equal to 150.

### Example 3

```
Input:  num = "11111", t = 26
Output: "-1"
```
No number greater than 11111 has the product of its digits divisible by 26.

### Constraints

- `2 <= num.length <= 2 * 10^5`
- `num` consists only of digits in the range `['0', '9']`
- `num` does not contain leading zeros
- `1 <= t <= 10^14`

### Signature

```python
class Solution:
    def smallestNumber(self, num: str, t: int) -> str:
```

## User's restatement

> Okay. So the basic structure of the problem is unchanged. The major change, as stated,
> is indeed now the *answer* space cannot contain any digit in them at any place. I think
> it worth to declare out loud is that num provided can contain 0 just fine.
>
> The next change is that range of n is now [10, 10e200000] and range of t is now
> [1, 10e14]. This eliminates our bf search for two reason:
>
> 1. the garuanteed "10 steps away" is now gone. Also from the constaint, we know the ans
>    may even not exist, so now it is unbounded
> 2. You cannot search over a space of 10e200000 in reasonable time.
>
> So we are back at the discarded method and we need to think about the pattern in
> multiplication of the numbers digits. given that 0 is striped away, these numbers can be
> enumerated like novenary numbers (lol) but the multiplication is still under base 10.
>
> Okay. So the important thing we find is that numbers can combine to form a multiple of
> numbers not found in them (33 gets to multiplied to 1x of 9, for example).
>
> I think the first conclusion is that if t is a prime number that is >= 11, we can output
> -1 straight. Reason: there is no way we can make a multiple of 11 without 11 *directly*
> invovled. It is a prime number - so no single digits will come together and make a 11,
> 22, 33, etc. We can get rid a lot of numbers by that.
>
> Okay. So we know that prime numbers are, in fact, not deconstructable. Which leads us to
> other numbers: ones that can be deconstructed.
>
> So for other numbers, I think we should do that Euler algorithm kind of thing. To get the
> "ingredients" that we may use to multiply to that number. Basically the algorithm brake t
> down to all it's prime factors, and it will be important.
>
> Because we now have the cookbook to the number, we can know what do we need to cook the
> number out. However, same as the 33 example, we will have alternate recipies - a 4 is
> equivalant to 2 2s, a 9 is equivalant to 2 3s, so...
>
> ```
> 1 = nop. Filler like white bread
> 2 = atomic. prime.
> 3 = atomic. prime.
> 4 = can substitude 2 2
> 5 = atomic. prime.
> 6 = can substitude 1 2 and 1 3
> 7 = atomic. prime.
> 8 = can substitude 3 2 or 1 2 1 4
> 9 = can substitude 3 3
> ```
>
> so my idea is this:
>
> we will have 9 counters that tracks the prime ingredients we need to multiply to t. we can
> start by trying to shove large values at low digits first - that way we can construct a
> number that is as small as possible. We should try to construct by large number first, is
> because, if we use a alternative, say 33 versus 09, it is obvious that 33 is larger thanks
> to its two digits. add a digits multiplies answer by 10 inexplicitly.
>
> So our answer would be something like 1111111...23499 kind of stuff. and we can easily
> deduce that the final number cannot contain more than 1 2 or 1 3, or we will use a
> substitude 4, 6 or 9 instead. there also wont be 2 4 (okay the example is fried), as it
> will be replaced by a 8. So we can optimize that when we finish the counter, not until we
> are deep inside the search.
>
> The problem now is: now this number multiplies to t. How do we make it the smallest number
> that is larger than num?
>
> I think the algorithm works like:
>
> 1. if ans.len == len.num:
>    starts at the rightmost 1 at position p, bump it up to num[p], if it is still smaller,
>    bump it up to num[p]+1
> 2. if ans.len < len.num
>    pad 1 on left until they are equal length and do 1
> 3. well ans is already larger than num and it is the smallest we can construct of so
