#!/bin/python3

import os, sys, io
import glob
import subprocess

import argparse
from pathlib import Path

import json, csv

import re

maude_options = "-no-banner -no-wrap -no-ansi-color -no-tecla -batch"
maude_solution_regex = re.compile(
    r"Solution\s+(\d+)\s*rewrites:\s+(\d+)\s+in\s+(\d+)ms\s+cpu\s+\((\d+)ms\s+real\)\s+\((\d+|~)\s+rewrites\/second\)\s*result\s+([^:]+):\s+(.*?)\s+(?:No more solutions\.|Bye\.)")
line_count_initial_capacity = 8

csv_header = [
    "program", "constraints", "limit",
    "solution_count",
    "rewrites_avg", "rewrites_delta", "rewrites_dev", "rewrites_min", "rewrites_max",
    "time_cpu_avg", "time_cpu_delta", "time_cpu_dev", "time_cpu_min", "time_cpu_max",
    "time_real_avg", "time_real_delta", "time_real_dev", "time_real_min", "time_real_max",
    "rews_sec_avg", "rews_sec_delta", "rews_sec_dev", "rews_sec_min", "rews_sec_max"]

# Argument parsing

tens_suffixes = dict(k=1e3, m=1e6, b=1e9)
def shorthand_to_number(shorthand):
    if shorthand.isdigit():
        return shorthand
    else:
        return int(float(shorthand[0:-1]) * tens_suffixes[shorthand[-1].lower()])

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("files", type=Path, nargs='+')
    parser.add_argument("-l", "--limits", nargs='+', required=True)
    parser.add_argument("-i", "--iters", type=int, default=3)
    parser.add_argument("-o", "--out-dir", type=Path, default=Path("./out"))
    parser.add_argument("-e", "--export", type=Path, default=None)
    parser.add_argument("--cpu-time", action="store_true")

    args = parser.parse_args()
    args.limits = [shorthand_to_number(limit) for limit in args.limits]
    args.files = list(filter(lambda path : path.suffix == ".maude", args.files))
    return args

def print_progress(text, completed_count, total_count, mark=False, end="\n"):
    print("\t> ", end="") if mark else print("\t  ", end="")
    progress = "{:.0f}%".format((completed_count) / total_count * 100).rjust(4, " ")
    print(f"{'{0:<50}'.format(text)} {progress} ({completed_count}/{total_count})", end=end)

# Problem generation

def generate_one_problem(path, limit, data):
    problem = f"load {path}\n\n"
    if len(data["cases"]) > 1: raise Exception("Support for several cases per program still not supported")
    for case in data["cases"]:
        problem += f"srew [{limit}] in {data['module']} : {case['term']} using {case['strat']} .\n"
    problem += "\nquit"

    return problem

def select_meta_file(path):
    parent_dir = path.parents[0]
    paths = glob.glob(str(parent_dir / "*.benchmark-meta.json"))
    if len(paths) == 0:
        return None
    else:
        return max(paths, key=len)

def generate_problems(out_dir, paths, limits):
    problem_paths = []

    out_dir.mkdir(parents=True, exist_ok=True)
    total_count = len(paths) * len(limits)
    completed_count = 0

    for path in paths:
        benchmark_meta_file = select_meta_file(path)
        if benchmark_meta_file is None:
            completed_count += len(limits)
            print_progress(f"(skipping: {path.stem.replace('_', ' ')}, no benchmark-meta file)", completed_count, total_count)
        else:
            benchmark_meta = json.load(open(benchmark_meta_file, "r"))
            for limit in limits:
                relative_problem_path = os.path.relpath(path.resolve(), out_dir.resolve())
                problem = generate_one_problem(relative_problem_path, limit, benchmark_meta)

                problem_file_path = Path(str(out_dir / path.stem) + f"_{limit}.maude")
                if os.path.exists(problem_file_path):
                    completed_count += 1
                    print_progress(f"(skipping: {problem_file_path.stem.replace('_', ' ')}, file already exists)", completed_count, total_count)
                else:
                    problem_file = open(problem_file_path, "w")
                    problem_file.write(problem)
                    problem_file.close()

                    completed_count += 1
                    print_progress(problem_file_path.stem.replace("_", " "), completed_count, total_count)

                problem_paths.append(problem_file_path)

    return problem_paths

# Running in Maude  

def get_maude_last_solution(process):
    line_count_capacity = line_count_initial_capacity

    buffer = [None] * line_count_capacity
    i = 0
    for line in io.TextIOWrapper(process.stdout, encoding="utf-8"):
        if line.startswith("Solution"):
            i = 0

        if i >= line_count_capacity:
            buffer += [None] * line_count_capacity
            line_count_capacity *= 2

        buffer[i] = line
        i += 1

    return "".join(buffer[:i])

def run_problems(out_dir, paths, iters):
    result_paths = []

    out_dir.mkdir(parents=True, exist_ok=True)
    total_count = len(paths) * iters
    completed_count = 0

    for index, path in enumerate(paths):
        out_path = out_dir / path.with_suffix(".txt").name
        command = f"maude {maude_options} {path}"

        if os.path.exists(out_path):
            completed_count += iters
            print_progress(f"(skipping: {path.stem.replace('_', ' ')}, file already exists)", completed_count, total_count, True)
        else:
            out_file = open(out_path, "wb")
            for i in range(iters):
                print_progress(path.stem.replace("_", " "), completed_count, total_count, i == 0, end=" ")
                for _ in range(i): print("*", end="")
                print()

                with subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as process:
                    last_solution = get_maude_last_solution(process)
                    stderr = process.stderr.read()

                out_file.write(f">>> Iter {i + 1} of {iters}\n".encode("utf-8"))
                out_file.write(stderr)
                out_file.write("... output partially omitted ...\n".encode("utf-8"))
                out_file.write(last_solution.encode("utf-8"))
                out_file.write("\n<<<\n".encode("utf-8"))
                out_file.flush()

                completed_count += 1

            out_file.close()
        result_paths.append(out_path)

    print_progress("", completed_count, total_count)

    return result_paths

# Output parsing

def parse_output(paths, iters):
    results = []

    total_count = len(paths) * iters
    completed_count = 0

    for index, path in enumerate(paths):
        out_file = open(path, "r")

        result = dict()
        result = {
            "path": path,
            "solution_number": [],
            "rewrites": [],
            "cpu_time": [],
            "real_time": [],
            "rewrites_second": [],
            "result_sort": [],
            "result_term": []
        }

        solutions = re.findall(maude_solution_regex, out_file.read())
        if len(solutions) < 1:
            completed_count += iters
            print(f"warning: no solutions found in `{path}`")
        elif len(solutions) != iters:
            completed_count += iters
            print(f"warning: unexpected number of solutions (actual: {len(solutions)}, expected: {iters}) found in `{path}`")
        else:
            for solution in solutions:
                result["solution_number"].append(int(solution[0]))
                result["rewrites"].append(int(solution[1]))
                result["cpu_time"].append(int(solution[2]))
                result["real_time"].append(int(solution[3]))
                try:
                    result["rewrites_second"].append(int(solution[4]))
                except ValueError:
                    result["rewrites_second"].append(None)
                result["result_sort"].append(solution[5])
                result["result_term"].append(solution[6])

                completed_count += 1
                print_progress(path.stem.replace("_", " "), completed_count, total_count)

        out_file.close()
        results.append(result)

    return results

# Data presentation and exporting

empty_space = "{0:<50}".format("")

def calculate_stats(values):
    values = [value for value in values if value]

    stats = dict()
    if len(values) == 0:
        stats["average"] = None
        stats["max_value"] = None
        stats["min_value"] = None
        stats["distance"] = None
        stats["std_dev"] = None
    else:
        stats["average"] = sum(values) / len(values)
        stats["max_value"] = max(values)
        stats["min_value"] = min(values)
        stats["distance"] = abs(stats["max_value"] - stats["average"])
        stats["std_dev"] = sum((value - stats["average"]) ** 2 for value in values) / len(values)
    return stats

def print_one_attribute(name, values, unit="", precision=2):
    stats = calculate_stats(values)

    if stats["average"] is None:
        print("{} {:<20} {:>12s}{:<2} ± {:>6s} (σ: ~, min: ~, max: ~)".format(
            empty_space, name + ":", "~", unit, "~"))
    else:
        print("{} {:<20} {:12.{prec}f}{:<2} ± {:6.{prec}f} (σ: {:.2f}, min: {:>3.{prec}f}, max: {:>3.{prec}f})".format(
            empty_space, name + ":", stats["average"], unit, stats["distance"], stats["std_dev"], stats["min_value"], stats["max_value"], prec=precision))

def print_summary(results, cpu_time=False):
    for result in results:
        result_id = result["path"].stem.replace("_", " ")

        reached = min(result["solution_number"])
        limit = int(result_id.split(" ")[-1])
        print(f"{'{0:<50}'.format(result_id)} reached solution {reached} {'(cutoff)' if reached >= limit else ''}")
        print_one_attribute("Rewrites", result["rewrites"], precision=0)
        if cpu_time:
            print_one_attribute("Time (CPU)", result["cpu_time"], "ms")
        print_one_attribute("Time (real)", result["real_time"], "ms")
        print_one_attribute("Rewrites/second", result["rewrites_second"], precision=0)

        print()

def unpack_stats(stats):
    return [stats["average"], stats["distance"], stats["std_dev"], stats["min_value"], stats["max_value"]]

def export_summary(results, path):
    export_file = open(path, "w")
    writer = csv.writer(export_file)

    writer.writerow(csv_header)
    for result in results:
        split = result["path"].stem.split("_")
        if len(split) == 3:
            program, constraints, limit = split
        elif len(split) == 2:
            program, limit = split
            constraints = ""
        row = [program, constraints, limit, min(result["solution_number"])]
        row += unpack_stats(calculate_stats(result["rewrites"]))
        row += unpack_stats(calculate_stats(result["cpu_time"]))
        row += unpack_stats(calculate_stats(result["real_time"]))
        row += unpack_stats(calculate_stats(result["rewrites_second"]))

        writer.writerow(row)

    export_file.close()

# Entry point

def benchmark(args=parse_args()):
    print(f"Generating {len(args.files) * len(args.limits)} problems...")
    problems = generate_problems(args.out_dir / "problems", args.files, args.limits)

    print(f"\nRunning {len(problems)} problems ({args.iters} times each)...")
    results = run_problems(args.out_dir / "results", problems, args.iters)

    print(f"\nParsing output of {len(results) * args.iters} results...")
    parsed = parse_output(results, args.iters)

    print("\n==== Summary ============")
    print(f"Format: program [constraints] limit\t\t({args.iters} iterations each)")
    print()
    print_summary(parsed, args.cpu_time)

    if args.export is not None:
        print(f"Saving data to `{args.export}`...")
        export_summary(parsed, args.export)

benchmark()