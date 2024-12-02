import timeit
import statistics

setup_code = """
from main import get_athan 
"""

number_of_runs = 10
times = timeit.repeat(
    stmt="get_athan()",
    setup=setup_code,
    number=1,
    repeat=number_of_runs
)

print(f"Average execution time: {statistics.mean(times):.4f} seconds")
print(f"Fastest run: {min(times):.4f} seconds")
print(f"Slowest run: {max(times):.4f} seconds")
print(f"Standard deviation: {statistics.stdev(times):.4f} seconds")