#!/bin/bash

# Set the input field separator to comma
IFS=','

# Open the CSV file for reading
while read -r url destDir _; do
    # Execute your command with the first two columns as arguments
    node webpage_puppeteer.js  "$url" "./Data/$destDir"
done < "./sample/testSet.csv"
