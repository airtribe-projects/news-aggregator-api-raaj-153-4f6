const fs = require("fs").promises;
const path = require("path");

function getUsersFilePath() {
  // Assumes utils is in src/utils, users.json is in ../data
  return path.join(__dirname, "../data/users.json");
}

async function readUsers() {
  try {
    const data = await fs.readFile(getUsersFilePath(), "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(
    getUsersFilePath(),
    JSON.stringify(users, null, 2),
    "utf-8"
  );
}

module.exports = {
  readUsers,
  writeUsers,
};
