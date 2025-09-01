# Instagram Connection Analyzer

A simple Node.js script to analyze your Instagram `followers` and `following` data. It helps you quickly identify mutual connections, users who don't follow you back, and fans you aren't following back.

## Features

-   **Mutual Followers**: See a list of users who you follow and who also follow you back.
-   **Not Following You Back**: Identify accounts you follow that do not follow you in return.
-   **You Don't Follow Back**: Find accounts that follow you, but you don't follow back.
-   **Zero Dependencies**: Runs with a standard Node.js installation, no `npm install` needed.
-   **Simple & Fast**: Directly parses the JSON files from your official Instagram data export.

---

## Prerequisites

-   Node.js (version 14.x or newer is recommended).
-   Your Instagram data archive (specifically the `followers_1.json` and `following.json` files).

---

## Setup and Usage

### 1. Download Your Instagram Data

First, you need to request your data from Instagram. To get only the necessary files and speed up the process, follow these steps carefully:

1.  Go to your Instagram profile on the web or in the app.
2.  Navigate to **Settings and privacy** > **Accounts Center**.
3.  Select **Your information and permissions** > **Download your information**.
4.  Click **Request a download**.
5.  Choose your profile and click **Next**.
6.  Select the **"Select types of information"** option.
7.  Scroll down and check the box for **"Followers and following"** ONLY. This is important for a small, quick download.
8.  Set the format to **JSON** and media quality to **Low** (it doesn't matter for this data).
9.  Click **Submit request**.

Instagram will notify you via email when your data is ready to download.

### 2. Prepare the Files

1.  Download and unzip the file from Instagram.
2.  Inside the extracted folder, navigate to the `followers_and_following` directory.
3.  You will find `followers_1.json` and `following.json`. Copy both of these files.
4.  Paste them into the root directory of this project (`Check-Connection-Instagram2/`).

> **Note:** If your followers file is named differently (e.g., `followers_2.json`), you must update the `FOLLOWERS_FILE` constant at the top of the `index.js` file.

### 3. Run the Script

Download source code from github:

1. Download source code from github with zip.
2. Unzip.
3. Run script with command.
```bash
node index.js
```

or you can download source code from terminal or command prompt:

1. download source code with git clone
```bash
git clone https://github.com/ghanirahmans/Analyzer-Connection-Instagram.git
```

2. and then change directory to Analyzer-Connection-Instagram
```bash
cd Analyzer-Connection-Instagram
```
3. run script with command
```bash
node index.js
```

Make sure in the directory have Instagram data by following `following.json` dan `followers_1.json`.

### 4. Format Folder

Analyzer-Connection-Instagram/
|--index.js
|--followers_1.json
|--following.json


## Example Output

The script will print the categorized lists directly to your console, along with a count for each category.

```
[INFO] Successfully loaded 82 Followers from followers_1.json.
[INFO] Successfully loaded 76 Following from following.json.

--- Results ---

Mutual Followers (55):
- username_1
- username_2
...

Who is not following you back (21):
- username99
- username98
...

Who you don't follow back (27):
- username73
- username72
...
```

## License

This project is licensed under the MIT License.