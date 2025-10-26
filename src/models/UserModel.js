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
