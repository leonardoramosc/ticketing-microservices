import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../__mocks__/nats-wrapper";
import { Subjects } from "@microservices-tickets-course/common";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it.each([
  OrderStatus.AWAITING_PAYMENT,
  OrderStatus.COMPLETE,
  OrderStatus.CREATED,
])("returns an error if the ticket is already reserved", async (status) => {
  const ticket = Ticket.build({ title: "concert", price: 20, id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const order = Order.build({
    userId: "user-id",
    expiresAt: new Date(),
    status,
    ticket,
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({ title: "concert", price: 20, id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});

it("reserves a ticket even if it has a cancelled order", async () => {
  const ticket = Ticket.build({ title: "concert", price: 20, id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const order = Order.build({
    userId: "user-id",
    expiresAt: new Date(),
    status: OrderStatus.CANCELLED,
    ticket,
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({ title: "concert", price: 20, id: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalledWith(Subjects.OrderCreated, expect.any(String), expect.any(Function))
})
