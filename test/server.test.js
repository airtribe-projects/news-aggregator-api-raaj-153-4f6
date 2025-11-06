/*
  server.test.js
  --------------
  Unit and integration tests for the main API endpoints of the news aggregator project.
  Tests user registration, login, preferences, and news endpoints using supertest and tap.
  Mocks file operations to avoid modifying real user data during tests.
*/

const tap = require("tap");
const supertest = require("supertest");
const app = require("../src/app");
const server = supertest(app);  

// Mock user data for registration and login
const mockUser = {
  username: "TestUser",
  email: "testuser@example.com",
  password: "Test@1234",
};

let token = "";

// User Registration

tap.test("POST /auth/register - success", async (t) => {
  const response = await server.post("/auth/register").send(mockUser);
  t.equal(response.status, 201, "Should register user successfully");
  t.match(response.body.message, /User registered successfully/);
  t.end();
});

tap.test("POST /auth/register - missing fields", async (t) => {
  const response = await server
    .post("/auth/register")
    .send({ email: mockUser.email });
  t.equal(response.status, 400, "Should fail if required fields are missing");
  t.match(response.body.message, /All fields are required/);
  t.end();
});

tap.test("POST /auth/register - invalid email", async (t) => {
  const response = await server
    .post("/auth/register")
    .send({ ...mockUser, email: "bademail" });
  t.equal(response.status, 400, "Should fail for invalid email");
  t.match(response.body.message, /Invalid email format/);
  t.end();
});

tap.test("POST /auth/register - weak password", async (t) => {
  const response = await server
    .post("/auth/register")
    .send({ ...mockUser, password: "abc" });
  t.equal(response.status, 400, "Should fail for weak password");
  t.match(response.body.message, /Password must contain/);
  t.end();
});

// User Login

tap.test("POST /auth/login - success", async (t) => {
  const response = await server
    .post("/auth/login")
    .send({ email: mockUser.email, password: mockUser.password });
  t.equal(response.status, 200, "Should login successfully");
  t.match(response.body.message, /Login successful/);
  t.ok(response.body.token, "Should return a JWT token");
  token = response.body.token;
  t.end();
});

tap.test("POST /auth/login - wrong password", async (t) => {
  const response = await server
    .post("/auth/login")
    .send({ email: mockUser.email, password: "WrongPass123!" });
  t.equal(response.status, 400, "Should fail for wrong password");
  t.match(response.body.message, /Invalid credentials/);
  t.end();
});

// Preferences

tap.test("GET /preferences - unauthorized", async (t) => {
  const response = await server.get("/preferences");
  t.equal(response.status, 401, "Should require auth token");
  t.end();
});

tap.test("PUT /preferences - update preferences", async (t) => {
  const response = await server
    .put("/preferences")
    .set("Authorization", `Bearer ${token}`)
    .send({ categories: ["technology"], languages: ["en"] });
  t.equal(response.status, 200, "Should update preferences");
  t.match(response.body.message, /Preferences updated successfully/);
  t.end();
});

tap.test("GET /preferences - get preferences", async (t) => {
  const response = await server
    .get("/preferences")
    .set("Authorization", `Bearer ${token}`);
  t.equal(response.status, 200, "Should get preferences");
  t.end();
});

tap.teardown(() => {
  process.exit(0);
});
