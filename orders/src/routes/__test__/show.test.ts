import request from "supertest";
import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import mongoose from "mongoose";

it("fetches the order", async () => {
  const ticket = Ticket.build({
    price: 20,
    title: "concert",
    id: new mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(200);

  expect(response.body).toEqual(order)
});

it("should send 404 if user tries to fetch another user order", async () => {
  const ticket = Ticket.build({
    price: 20,
    title: "concert",
    id: new mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin('other-user'))
    .expect(404);
});
