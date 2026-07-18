import request from "supertest";
import app from "../index";
import pool from "../config/db";

const testUser = {
  name: "Test User",
  email: "userstest@example.com",
  password: "testpassword123",
};

let token: string;
let userId: number;

beforeAll(async () => {
  // Clean up
  await pool.query("DELETE FROM users WHERE email = ?", [testUser.email]);

  // Create test user
  const registerRes = await request(app).post("/users").send(testUser);
  userId = registerRes.body.id;

  // Login to get token
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: testUser.email, password: testUser.password });
  token = loginRes.body.token;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = ?", [testUser.email]);
  await pool.query("DELETE FROM users WHERE email = ?", [
    "updated@example.com",
  ]);
  await pool.end();
});

describe("GET /users", () => {
  it("should return users list with valid token", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should return 401 without token", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(401);
  });
});

describe("GET /users/:id", () => {
  it("should return user by id", async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(testUser.email);
  });

  it("should return 404 for non-existent user", async () => {
    const response = await request(app)
      .get("/users/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should return 400 for invalid id", async () => {
    const response = await request(app)
      .get("/users/abc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});

describe("POST /users", () => {
  it("should create user with valid data", async () => {
    const response = await request(app).post("/users").send({
      name: "New User",
      email: "newuser@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    // cleanup
    await pool.query("DELETE FROM users WHERE email = ?", [
      "newuser@example.com",
    ]);
  });

  it("should return 400 with invalid email", async () => {
    const response = await request(app)
      .post("/users")
      .send({ name: "John", email: "notanemail", password: "password123" });

    expect(response.status).toBe(400);
  });

  it("should return 409 with duplicate email", async () => {
    const response = await request(app).post("/users").send(testUser);

    expect(response.status).toBe(409);
  });
});

describe("PUT /users/:id", () => {
  it("should update user with valid data", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name", email: "updated@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User updated successfully");
  });

  it("should return 404 for non-existent user", async () => {
    const response = await request(app)
      .put("/users/99999")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated", email: "updated99999@example.com" });

    expect(response.status).toBe(404);
  });

  it("should return 401 without token", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .send({ name: "Updated", email: "updated@example.com" });

    expect(response.status).toBe(401);
  });
});

describe("DELETE /users/:id", () => {
  it("should delete user successfully", async () => {
    // Create a user to delete
    const createRes = await request(app)
      .post("/users")
      .send({
        name: "To Delete",
        email: "todelete@example.com",
        password: "password123",
      });

    const deleteId = createRes.body.id;

    const response = await request(app)
      .delete(`/users/${deleteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User deleted successfully");
  });

  it("should return 404 for non-existent user", async () => {
    const response = await request(app)
      .delete("/users/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should return 401 without token", async () => {
    const response = await request(app).delete(`/users/${userId}`);

    expect(response.status).toBe(401);
  });
});
