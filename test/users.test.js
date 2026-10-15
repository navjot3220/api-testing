const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("supports creating, reading, updating, and deleting users", async () => {
  const createResponse = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Ada Lovelace", email: "ADA@example.com" }),
  });
  assert.equal(createResponse.status, 201);
  const createdUser = await createResponse.json();
  assert.equal(createdUser.name, "Ada Lovelace");
  assert.equal(createdUser.email, "ada@example.com");

  const listResponse = await fetch(`${baseUrl}/api/users`);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), [createdUser]);

  const updateResponse = await fetch(`${baseUrl}/api/users/${createdUser.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Ada Byron", email: "ada@example.com" }),
  });
  assert.equal(updateResponse.status, 200);
  assert.deepEqual(await updateResponse.json(), {
    id: createdUser.id,
    name: "Ada Byron",
    email: "ada@example.com",
  });

  const deleteResponse = await fetch(`${baseUrl}/api/users/${createdUser.id}`, {
    method: "DELETE",
  });
  assert.equal(deleteResponse.status, 204);

  const missingResponse = await fetch(`${baseUrl}/api/users/${createdUser.id}`);
  assert.equal(missingResponse.status, 404);
});

test("rejects invalid user data", async () => {
  const response = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "No email" }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "A non-empty name and valid email are required.",
  });
});
