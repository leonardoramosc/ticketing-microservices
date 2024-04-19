import request from "supertest";
import { app } from "../../app";

it("fails when a email that does not exist is supply", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "123456",
    })
    .expect(400);
});

it("fails when an incorrect password is supplied", async () => {
  await signup()

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "123456",
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await signup()

  const resonse = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);

  expect(resonse.get('Set-Cookie')).toBeDefined()
})
