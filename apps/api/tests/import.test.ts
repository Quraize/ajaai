import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

async function login(email: string, password: string) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.token as string;
}

describe("File import", () => {
  it("imports a .txt file as a new document", async () => {
    const token = await login("alice@example.com", "password123");

    const res = await request(app)
      .post("/api/documents/import")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("Hello world\n\nThis is a test."), "test.txt")
      .expect(201);

    expect(res.body.title).toBe("test");
    expect(res.body.content).toContain("Hello world");
  });

  it("rejects unsupported file types", async () => {
    const token = await login("alice@example.com", "password123");

    await request(app)
      .post("/api/documents/import")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("unsupported"), "file.pdf")
      .expect(400);
  });
});
