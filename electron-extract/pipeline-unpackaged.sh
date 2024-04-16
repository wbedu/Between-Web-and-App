#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <application>"
    exit 1
fi

filename=$(basename -- "$1")
extension="${filename##*.}"
filename="${filename%.*}"

echo $1
echo $filename

mkdir "out/${filename}_extract"

mkdir "out/${filename}_extract/unpackaged"


find "$1/Contents/" -type f -name "*.js" -exec cp {} "./out/${filename}_extract/unpackaged" \;


echo "symbol,object,linenumber,filename,function" >> "${filename}.csv"

if [ -d "out/${filename}_extract" ]; then
    for subdir in out/"${filename}_extract"/*; do
        echo "In subdirectory ${subdir}"
        for file in "$subdir"/*; do
            if [[ $file == *.unminified.js ]]; then
                echo "Skipping $file"
                continue
            fi
            echo "$file"
            node transpile.js "$file"

            transpiled_file="${file%.*}.unminified.js"

            node traverse.js "$transpiled_file" >> "${filename}.csv"
        done
    done
else
    echo "Out directory not found: out/${filename}_extract"
    exit 1
fi

