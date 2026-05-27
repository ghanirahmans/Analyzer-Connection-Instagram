/**
 * @file This script analyzes Instagram's followers and following data
 * to determine mutual connections, users who don't follow back,
 * and users you don't follow back.
 * @version 1.1.0
 */

// Importing necessary core Node.js modules.
const path = require('path');
const fs = require('fs');

/**
 * Define the paths to the followers and following JSON files.
 * Put both files inside the data directory.
 */
const DATA_DIR = path.join(process.cwd(), 'data');
const FOLLOWERS_FILE = path.join(DATA_DIR, 'followers_1.json');
const FOLLOWING_FILE = path.join(DATA_DIR, 'following.json');

function extractUsername(user) {
  const stringListUsername = user?.string_list_data?.find(entry => entry?.value)?.value;
  return stringListUsername || user?.title || user?.value || user?.username || null;
}

function uniqueSortedUsernames(usernames) {
  return [...new Set(usernames.filter(Boolean))]
    .map(username => String(username).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Reads a JSON file, parses it, and extracts a list of usernames.
 * It's designed to handle the specific structure of Instagram's data export files.
 * @param {string} filePath - The absolute path to the JSON file.
 * @returns {string[]} An array of usernames, or an empty array if an error occurs.
 */
function getUsernamesFromFile(filePath) {
  // First, check if the file exists to prevent a crash.
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File not found: ${filePath}, please ensure the file exists.`);
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
    const targetData = data.relationships_following ?? data.relationships_followers ?? data;

    if (!Array.isArray(targetData)) {
      console.error(`[ERROR] Invalid Instagram JSON structure in ${filePath}.`);
      return [];
    }

    // Log a success message with the count of items loaded.
    const fileType = filePath === FOLLOWERS_FILE ? 'Followers' : 'Following';
    console.log(`[INFO] Successfully loaded ${targetData.length} ${fileType} from ${path.basename(filePath)}.`);

    // Map over the data array to extract the username from Instagram's export structure.
    const usernames = uniqueSortedUsernames(targetData.map(extractUsername));

    if (!usernames.length) {
      console.error(`[ERROR] No usernames found in ${filePath}. Make sure it is exported as JSON from Followers and following.`);
    }

    return usernames;
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
  console.log(`[INFO] Reading Instagram data from: ${DATA_DIR}`);

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
// are inside the data directory.
