import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { natsWrapper } from "../../__mocks__/nats-wrapper";
import { Subjects } from "@microservices-tickets-course/common";
import { Ticket } from "../../models/ticket";

it("return 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "gola",
      price: 20,
    })
    .expect(404);
});

it("return 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "gola",
      price: 20,
    })
    .expect(401);
});

it("return 401 if the user does not own the ticket", async () => {
  const ticketCreatedResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "title",
      price: 10,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticketCreatedResponse.body.id}`)
    .set("Cookie", global.signin("another-user-id"))
    .send({
      title: "gola",
      price: 20,
    })
    .expect(401);
});

it("return 400 if the user provides an invalid title or price", async () => {
  const ticketCreatedResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "title",
      price: 10,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticketCreatedResponse.body.id}`)
    .set("Cookie", global.signin())
    .send({
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticketCreatedResponse.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "hola",
      price: -1,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticketCreatedResponse.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "hola",
    })
    .expect(400);
});

it("updates the ticket if provided valid fields", async () => {
  const ticketCreatedResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "title",
      price: 10,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticketCreatedResponse.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(200);

  const ticketResponse = await request(app).get(`/api/tickets/${ticketCreatedResponse.body.id}`).send().expect(200)
  expect(ticketResponse.body).toEqual(expect.objectContaining({
    title: 'new title',
    price: 20
  }))
  expect(natsWrapper.client.publish).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(Subjects.TicketUpdated, expect.any(String), expect.any(Function))
});

it("should send error if ticket is reserved", async () => {
  const ticketCreatedResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "title",
      price: 10,
    })
    .expect(201);

  const ticketCreated = await Ticket.findById(ticketCreatedResponse.body.id)

  ticketCreated!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })

  await ticketCreated?.save()

  await request(app)
    .put(`/api/tickets/${ticketCreatedResponse.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(400).expect({ errors: [ { message: 'Cannot edit a reserved ticket' } ] })
});
