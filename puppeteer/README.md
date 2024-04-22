# Webpage Puppeteer

## Overview

Webpage Puppeteer is a script designed to analyze webpages for potential trackers and fingerprinting attempts. While the script cannot  detect whether information is being collected for fingerprinting purposes, it captures calls that could enable fingerprinting.

## Installation

Ensure you have Node.js installed on your system. Then, clone this repository and navigate to its directory:

Install dependencies:

```bash
npm install
```

## Usage

To use Webpage Puppeteer, run the script `webpage_puppeteer.js` with the following command-line arguments:

node webpage_puppeteer.js <url> <output-path>

- url: The URL of the webpage you want to analyze.
- output-path: The path where the analysis results will be saved. This should include the filenames `resources.json` and `functionCalls.json`.

Example usage:

node webpage_puppeteer.js https://example.com /path/to/output

## Output

The script generates two JSON files:

1. `resources.json`: This file contains information about resources loaded by the webpage, such as scripts, stylesheets, images, etc.
2. `functionCalls.json`: This file contains information about function calls made during the webpage's execution, which could potentially be used for fingerprinting.

## Disclaimer

Webpage Puppeteer provides insights into potential tracking and fingerprinting activity on webpages. However, it does not definitively determine the intent behind such activity. Interpret the results with caution and consider additional factors when assessing the privacy and security implications of a webpage.
