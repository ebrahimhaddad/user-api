import request from "supertest";
import app from "../index";
import pool from "../config/db";

// Test user credentials
const testUser = {
  name: "Test User",
  email: "testuser@example.com",
  password: "testpassword123",
};

// Clean up before and after tests
beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = ?", [testUser.email]);
  await request(app).post("/users").send(testUser);
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = ?", [testUser.email]);
  await pool.end();
});

describe("POST /auth/login", () => {
  it("should return token with valid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.message).toBe("Login successful");
  });

  it("should return 401 with wrong password", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });

  it("should return 401 with unknown email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password: "secret123" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });

  it("should return 400 when email is missing", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ password: "secret123" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });

  it("should return 400 when password is missing", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });
});
