# resource_list.js

This script monitors an instance of puppeteer for suspected tracker requests.

### Requirements

- Node.js installed on your machine
- npm (Node Package Manager)

### Installation

2. Navigate to the directory:

```bash
cd puppeteer
```

3. Install dependencies:

```bash
npm install
```

### Usage

Run the script with the following command:

```bash
node node resource_list.js [URL] [OutputPath]
```

- [URL]: The URL of the website you want to analyze for tracker requests.
- [OutputPath]: The file path where you want to save the JSON output.

### Example

```bash
node node resource_list.js https://example.com output.json
```

This command will analyze the network requests made by `https://example.com` and save suspected tracker requests to `output.json`.

### Notes

- Ensure that Puppeteer is properly installed in your environment.
- The script utilizes Puppeteer to log network requests and determines suspected tracker requests
