const { readUsers, writeUsers } = require("../utils/userFileUtils");
const path = require("path");

const usersFile = path.join(__dirname, "../data/users.json");

function isValidPreferences(categories, languages) {
  return (
    Array.isArray(categories) && categories.every(c => typeof c === "string" && c.length > 0) &&
    Array.isArray(languages) && languages.every(l => typeof l === "string" && l.length > 0)
  );
}

exports.getPreferences = async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find((u) => u.id === req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { categories, languages } = req.body;

    // Input validation
    if (!isValidPreferences(categories, languages)) {
      return res.status(400).json({ message: "Invalid preferences format. 'categories' and 'languages' must be non-empty arrays of strings." });
    }

    const users = await readUsers();

    const userIndex = users.findIndex((u) => u.id === req.user.userId);
    if (userIndex === -1)
      return res.status(404).json({ message: "User not found" });

    users[userIndex].preferences = { categories, languages };
    await writeUsers(users);

    res.json({
      message: "Preferences updated successfully",
      preferences: users[userIndex].preferences,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
