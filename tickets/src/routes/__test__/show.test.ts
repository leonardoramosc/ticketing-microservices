import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 400 if the ticket id is not a valid mongoid", async () => {
  const response = await request(app)
    .get(`/api/tickets/invalid-id`)
    .send()
    .expect(400);

  expect(response.body).toEqual({
    errors: [
      {
        field: "id",
        message: "Invalid ticket id",
      },
    ],
  });
});

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if exists", async () => {
  const title = "entrada lil supa";
  const price = 10;
  const { body: ticket } = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price })
    .expect(201);

  const existentTicketResponse = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signin())
    .send();

  expect(existentTicketResponse.status).toEqual(200);
  expect(existentTicketResponse.body).toEqual({
    id: ticket.id,
    title,
    price,
    userId: "id",
    version: 0
  });
});
