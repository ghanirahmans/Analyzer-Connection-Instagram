/**
 * @file This script analyzes Instagram's followers and following data
 * to determine mutual connections, users who don't follow back,
 * and users you don't follow back.
 * @version 1.1.0
 */

// Importing necessary core Node.js modules.
const path = require('path');
const fs = require('fs');

// --- Configuration ---
// Define the paths to your Instagram data files.
// NOTE: Adjust the filenames if they differ from the default export names.
const FOLLOWERS_FILE = path.join(__dirname, 'followers_1.json');
const FOLLOWING_FILE = path.join(__dirname, 'following.json');

/**
 * Reads a JSON file, parses it, and extracts a list of usernames.
 * It's designed to handle the specific structure of Instagram's data export files.
 * @param {string} filePath - The absolute path to the JSON file.
 * @returns {string[]} An array of usernames, or an empty array if an error occurs.
 */
function getUsernamesFromFile(filePath) {
    // First, check if the file exists to prevent a crash.
    if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] File not found: ${filePath}`);
        return [];
    }

    try {
        // Read the entire file content as a UTF-8 string.
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        // Parse the JSON string into a JavaScript object.
        const data = JSON.parse(fileContent);

        // The 'following.json' file has a root key 'relationships_following',
        // while 'followers_1.json' has the data as the root array.
        // This line handles both structures gracefully.
        const targetData = data.relationships_following ?? data;

        // Log a success message with the count of items loaded.
        const fileType = filePath === FOLLOWERS_FILE ? 'Followers' : 'Following';
        console.log(`[INFO] Successfully loaded ${targetData.length} ${fileType} from ${path.basename(filePath)}.`);

        // Map over the data array to extract the username ('value') from the nested structure.
        // Optional chaining (?.) is used to prevent errors if the structure is not as expected.
        return targetData.map(user => user.string_list_data[0]?.value);
    } catch (error) {
        // Catch and log any errors that occur during file reading or JSON parsing.
        console.error(`[ERROR] Failed to parse data from ${filePath}:`, error);
        return [];
    }
}

/**
 * Displays a list of usernames to the console, prefixed with a dash.
 * @param {string[]} usernames - The array of usernames to display.
 */
function displayUsernames(usernames) {
    usernames.forEach(username => console.log(`- ${username}`));
}

/**
 * Finds mutual followers (users who follow you and you follow back).
 * @param {string[]} followers - An array of your followers' usernames.
 * @param {string[]} following - An array of usernames you are following.
 * @returns {string[]} An array of usernames that are in both lists.
 */
function getmMutualFollowers(followers, following) {
    // Convert the 'following' array to a Set for efficient O(1) lookups.
    const followingSet = new Set(following);
    // Filter the 'followers' list to find users who are also in the 'followingSet'.
    return followers.filter(username => followingSet.has(username));
}

/**
 * Finds users you follow who do not follow you back.
 * @param {string[]} followers - An array of your followers' usernames.
 * @param {string[]} following - An array of usernames you are following.
 * @returns {string[]} An array of usernames from your 'following' list that are not in your 'followers' list.
 */
function getWhoNotFollowingBack(followers, following) {
    // Convert the 'followers' array to a Set for efficient lookups.
    const followersSet = new Set(followers);
    // Filter the 'following' list to find users who are NOT in the 'followersSet'.
    return following.filter(username => !followersSet.has(username));
}

/**
 * Finds users who follow you, but you do not follow back.
 * @param {string[]} followers - An array of your followers' usernames.
 * @param {string[]} following - An array of usernames you are following.
 * @returns {string[]} An array of usernames from your 'followers' list that are not in your 'following' list.
 */
function getWhoYouDontFollowBack(followers, following) {
    // Convert the 'following' array to a Set for efficient lookups.
    const followingSet = new Set(following);
    // Filter the 'followers' list to find users who are NOT in the 'followingSet'.
    return followers.filter(username => !followingSet.has(username));
}

/**
 * The main function to orchestrate the script's execution.
 */
function main() {
    // 1. Load usernames from the respective JSON files.
    const followers = getUsernamesFromFile(FOLLOWERS_FILE);
    const following = getUsernamesFromFile(FOLLOWING_FILE);
    console.log('\n--- Results ---');

    // 2. Calculate and display mutual followers.
    const mutuals = getmMutualFollowers(followers, following);
    console.log(`\nMutual Followers (${mutuals.length}):`);
    displayUsernames(mutuals);

    // 3. Calculate and display users who don't follow you back.
    const notFollowingBack = getWhoNotFollowingBack(followers, following);
    console.log(`\nWho is not following you back (${notFollowingBack.length}):`);
    displayUsernames(notFollowingBack);

    // 4. Calculate and display users you don't follow back.
    const youDontFollowBack = getWhoYouDontFollowBack(followers, following);
    console.log(`\nWho you don't follow back (${youDontFollowBack.length}):`);
    displayUsernames(youDontFollowBack);
}

// Execute the main function to run the script.
main();

// Note: To run this script, ensure that followers_1.json and following.json
// are in the same directory as this script.
