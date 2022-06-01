# STRASS
./bench.py ../examples/**/fixed/* -o out -e strass.csv -i 3 -l 250k 500k 1M

# ATAME
./bench.py atame/**/fixed/* -o out/atame -e atame.csv -i 3 -l 250k 500k 1M

# Original
./bench.py ../examples/*/* -o out/original -e original.csv -i 3 -l 250k 500k 1M