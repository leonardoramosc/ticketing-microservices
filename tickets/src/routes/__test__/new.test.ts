import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../__mocks__/nats-wrapper";
import { Subjects } from "@microservices-tickets-course/common";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
  expect(natsWrapper.client.publish).not.toHaveBeenCalled()
});

it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      price: 10,
    })
    .expect(400);

  expect(natsWrapper.client.publish).not.toHaveBeenCalled()
});

it("returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "concierto slipknot vip",
      price: "asdlkasjd",
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "concierto slipknot vip",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "concierto slipknot vip",
    })
    .expect(400);

  expect(natsWrapper.client.publish).not.toHaveBeenCalled()
});

it("returns creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find()
  const title = "concierto slipknot vip"
  const price = 100

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price
    })
    .expect(201);

  let ticketsAfterCreation = await Ticket.find()

  expect(ticketsAfterCreation.length).toBeGreaterThan(tickets.length)
  expect(ticketsAfterCreation[0].title).toEqual(title)
  expect(ticketsAfterCreation[0].price).toEqual(price)
});

it("returns creates a ticket with valid inputs", async () => {
  const title = "concierto slipknot vip"
  const price = 100

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price
    })
    .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalledWith(Subjects.TicketCreated, expect.any(String), expect.any(Function))
});
