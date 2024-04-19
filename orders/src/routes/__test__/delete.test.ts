import request from "supertest";
import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import { OrderStatus } from "../../models/order";
import { natsWrapper } from "../../__mocks__/nats-wrapper";
import { Subjects } from "@microservices-tickets-course/common";
import mongoose from "mongoose";

it("should cancel an order", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
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
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(204);

  const { body: updatedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(200);

  expect(updatedOrder.status).toEqual(OrderStatus.CANCELLED);
});

it("emits a order cancelled event", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
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
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.OrderCreated,
    expect.any(String),
    expect.any(Function)
  );
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.OrderCancelled,
    expect.any(String),
    expect.any(Function)
  );
});
