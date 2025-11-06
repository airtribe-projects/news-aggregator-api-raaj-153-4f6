/*
  UserModel.js
  ------------
  Provides functions for managing user data using file-based storage.
  Exposes methods to find a user by email, add a new user, and get all users.
  Uses shared utility functions for reading and writing user data.
*/

const { readUsers, writeUsers } = require("../utils/userFileUtils");

module.exports = {
  findUserByEmail: async (email) => {
    const users = await readUsers();
    return users.find((u) => u.email === email);
  },
  addUser: async (user) => {
    const users = await readUsers();
    users.push(user);
    await writeUsers(users);
  },
  getAllUsers: async () => {
    return await readUsers();
  },
};
