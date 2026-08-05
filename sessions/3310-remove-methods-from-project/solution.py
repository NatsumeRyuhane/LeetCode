from collections import deque, defaultdict

class Solution:
    def remainingMethods(self, n: int, k: int, invocations: List[List[int]]) -> List[int]:
        d_src: defaultdict[int, set[int]] = defaultdict(set)
        d_dst: defaultdict[int, set[int]] = defaultdict(set)
        dirty: set[int] = set()

        counter = 0
        for i in invocations:
            counter += 1
            src, dst = i[0], i[1]
            d_src[src].add(dst)
            d_dst[dst].add(src)
        print(f"counter1 = {counter}")

        q: deque[int] = deque()
        q.append(k)

        counter = 0
        while len(q) != 0:
            counter += 1
            node = q.popleft()
            if node in dirty:
                continue
            
            dirty.add(node)

            for neighbor in d_src[node]:
                if neighbor in dirty:
                    continue
                else:
                    q.append(neighbor)
        print(f"counter2 = {counter}")

        # print(dirty)

        # shortcut!
        if len(dirty) == n:
            return []

        can_remove = True
        counter = 0
        for d in dirty:
            counter += 1
            if not can_remove:
                break

            for upstream in d_dst[d]:
                if upstream not in dirty:
                    can_remove = False
                    # print(f"cant remove because of edge: [{upstream}, {d}]")
                    break
                else:
                    continue
        print(f"counter3 = {counter}")
        print(f"n = {n}, m = {len(invocations)}, n+m = {n+len(invocations)}")

        if can_remove:
            return [i for i in range(0, n) if i not in dirty]
        else:
            return [i for i in range(0, n)]