#!/bin/python3

import os
import sys
import itertools
import maude


if len(sys.argv) < 4:
        print("Usage: <iters> <case> <strat> [baseCase] [modBaseName]")
        quit()

tens = dict(k=1e3, m=1e6, b=1e9)
def to_number(x):
        if x.isdigit():
                return x
        else:
                return int(float(x[0:-1]) * tens[x[-1].lower()])

def srew(module, term, strategy, depth = False):
        m = maude.getModule(module)
        t = m.parseTerm(term)
        s = m.parseStrategy(strategy)
        return t.srewrite(s, depth)

def cleanIter(iter, limit):
        iter = itertools.islice(iter, 0, limit)
        iter = map(lambda tuple: str(tuple[0]), iter)
        return iter

def percent(a, b):
        return a / b * 100 if b else "inf"

iters = int(to_number(sys.argv[1]))
case = sys.argv[2]
strat = sys.argv[3]
baseCase = sys.argv[4] if len(sys.argv) >= 5 else sys.argv[2]
modBaseName = sys.argv[5] if len(sys.argv) >= 6 else baseCase

termsFile = open(baseCase + ".terms", "r")

maude.init()
maude.load(f"{case}-atame.maude")
maude.load(f"{case}-strass.maude")

onlyAtameCount = 0
onlyStrassCount = 0
solAtameCount = 0
solStrassCount = 0
for (line, term) in enumerate(termsFile.readlines()):
        if term.startswith("#"): continue

        print(f"Term {line}: {term}", end="")

        term = term.strip()

        solAtameIter = srew((modBaseName + "-fixed").upper(), term, "all *")
        solStrassIter = srew((modBaseName + "-strat").upper(), term, strat)

        solAtame = set(cleanIter(solAtameIter, iters))
        solStrass = set(cleanIter(solStrassIter, iters))

        onlyAtame = solAtame - solStrass
        onlyStrass = solStrass - solAtame

        onlyAtameCount += len(onlyAtame)
        onlyStrassCount += len(onlyStrass)
        solAtameCount += len(solAtame)
        solStrassCount += len(solStrass)

        print(f"\tOnly in ATAME:\t{len(onlyAtame)}/{len(solAtame)} {percent(len(onlyAtame),len(solAtame))}%")
        for sol in onlyAtame: print(f"\t\t{sol}")
        print(f"\tOnly in STRASS:\t{len(onlyStrass)}/{len(solStrass)} {percent(len(onlyStrass),len(solStrass))}%")
        for sol in onlyStrass: print(f"\t\t{sol}")

print(f"Stats:\tonly in ATAME \t{onlyAtameCount}/{solAtameCount} {percent(onlyAtameCount,solAtameCount)}%")
print(f"\tonly in STRASS \t{onlyStrassCount}/{solStrassCount} {percent(onlyStrassCount,solStrassCount)}%")