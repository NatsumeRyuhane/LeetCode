import time
t = time.perf_counter()
x = 0
for i in range(10**7):
    x += i
print(10**7 / (time.perf_counter() - t), "ops/sec")
