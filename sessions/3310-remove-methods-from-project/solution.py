from collections import deque, defaultdict

class Solution:
    def remainingMethods(self, n: int, k: int, invocations: List[List[int]]) -> List[int]:
        d_src: defaultdict[int, set[int]] = defaultdict(set)
        d_dst: defaultdict[int, set[int]] = defaultdict(set)
        dirty: set[int] = set()

        for i in invocations:
            src, dst = i[0], i[1]
            d_src[src].add(dst)
            d_dst[dst].add(src)

        q: deque[int] = deque()
        q.append(k)

        while len(q) != 0:
            node = q.popleft()

            dirty.add(node)

            for neighbor in d_src[node]:
                if neighbor in dirty:
                    continue
                else:
                    q.append(neighbor)

        # print(dirty)

        # shortcut!
        if len(dirty) == n:
            return []

        can_remove = True
        for d in dirty:
            if not can_remove:
                break

            for upstream in d_dst[d]:
                if upstream not in dirty:
                    can_remove = False
                    # print(f"cant remove because of edge: [{upstream}, {d}]")
                    break
                else:
                    continue

        if can_remove:
            return [i for i in range(0, n) if i not in dirty]
        else:
            return [i for i in range(0, n)]