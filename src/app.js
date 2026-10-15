const express = require("express");
const { randomUUID } = require("node:crypto");

const app = express();
const users = new Map();

app.use(express.json());

function validateUser(body) {
  if (
    !body ||
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
  ) {
    return "A non-empty name and valid email are required.";
  }
}

function emailInUse(email, excludedId) {
  return [...users.values()].some(
    (user) => user.id !== excludedId && user.email === email,
  );
}

app.get("/api/users", (req, res) => {
  res.json([...users.values()]);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json(user);
});

app.post("/api/users", (req, res) => {
  const validationError = validateUser(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  if (emailInUse(email)) {
    return res.status(409).json({ error: "Email is already in use." });
  }

  const user = { id: randomUUID(), name, email };
  users.set(user.id, user);
  res.status(201).json(user);
});

app.put("/api/users/:id", (req, res) => {
  const existingUser = users.get(req.params.id);
  if (!existingUser) {
    return res.status(404).json({ error: "User not found." });
  }

  const validationError = validateUser(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  if (emailInUse(email, existingUser.id)) {
    return res.status(409).json({ error: "Email is already in use." });
  }

  const user = { id: existingUser.id, name, email };
  users.set(user.id, user);
  res.json(user);
});

app.delete("/api/users/:id", (req, res) => {
  if (!users.delete(req.params.id)) {
    return res.status(404).json({ error: "User not found." });
  }
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Request body must be a valid JSON." });
  }
  next(error);
});

module.exports = app;
