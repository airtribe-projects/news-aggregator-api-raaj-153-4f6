const { readUsers, writeUsers } = require("../utils/userFileUtils");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function getPasswordError(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push("at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("an uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("a lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("a number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("a special character");
  }
  return errors.length
    ? `Password must contain ${errors.join(", ")}.`
    : null;
}

function isValidPassword(password) {
// Password must have at least 1 number, small letter, capital letter and special character and size should be greater than 8. 
 let n = password.length;
 let upperCaseFlag = false;
 let lowerCaseFlag = false;
 let numberFlag = false;
 let specialCharFlag = false;

 for(let i =0; i<n; i++){
   let char = password.charAt(i);
    if(char >= '0' && char <= '9'){
        numberFlag = true;
    }
    else if(char >= 'a' && char <= 'z'){
        lowerCaseFlag = true;
    }
    else if(char >= 'A' && char <= 'Z'){
        upperCaseFlag = true;
    }
    else{
        specialCharFlag = true;
    }
}
    return n >= 8 && upperCaseFlag && lowerCaseFlag && numberFlag && specialCharFlag;

}

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: getPasswordError(password) });
    }

    let users = await readUsers();
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      preferences: { categories: [], languages: [] },
    };

    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({ message: "User registered successfully", data: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    let users = await readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
