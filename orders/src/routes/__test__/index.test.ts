import request from "supertest";
import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import mongoose from "mongoose";

const buildTicket = async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  return ticket;
};

it("should fetch orders for a particular user", async () => {
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  const user1 = global.signin("user-1");
  const user2 = global.signin("user-2");

  await request(app)
    .post("/api/orders")
    .set("Cookie", user1)
    .send({
      ticketId: ticket1.id,
    })
    .expect(201);

  const { body: order1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({
      ticketId: ticket2.id,
    })
    .expect(201);

  const { body: order2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({
      ticketId: ticket3.id,
    })
    .expect(201);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", user2)
    .expect(200);

  expect(response.body.length).toEqual(2);

  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: order1.id }),
      expect.objectContaining({ id: order2.id }),
    ])
  );
});
