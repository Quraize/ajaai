import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/db.js";

async function login(email: string, password: string) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.token as string;
}

describe("Documents API", () => {
  beforeEach(async () => {
    await prisma.document.deleteMany();
    await prisma.share.deleteMany();
  });

  it("creates, reads, and updates a document", async () => {
    const token = await login("alice@example.com", "password123");

    const create = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Doc", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "hi" }] }] } })
      .expect(201);

    expect(create.body.title).toBe("My Doc");

    const get = await request(app)
      .get(`/api/documents/${create.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(get.body.title).toBe("My Doc");

    const update = await request(app)
      .patch(`/api/documents/${create.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated" })
      .expect(200);

    expect(update.body.title).toBe("Updated");
  });

  it("shares a document and allows shared user access", async () => {
    const aliceToken = await login("alice@example.com", "password123");
    const bobToken = await login("bob@example.com", "password123");

    const create = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({ title: "Shared Doc" })
      .expect(201);

    await request(app)
      .post(`/api/documents/${create.body.id}/share`)
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({ email: "bob@example.com", role: "editor" })
      .expect(201);

    const bobGet = await request(app)
      .get(`/api/documents/${create.body.id}`)
      .set("Authorization", `Bearer ${bobToken}`)
      .expect(200);

    expect(bobGet.body.title).toBe("Shared Doc");
  });

  it("blocks unauthorized access", async () => {
    const aliceToken = await login("alice@example.com", "password123");
    const carolToken = await login("carol@example.com", "password123");

    const create = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({ title: "Private" })
      .expect(201);

    await request(app)
      .get(`/api/documents/${create.body.id}`)
      .set("Authorization", `Bearer ${carolToken}`)
      .expect(404);
  });
});
