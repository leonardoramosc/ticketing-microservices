import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@microservices-tickets-course/common";

it("returns a 404 when order does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asdasdas",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns a 401 when purchasing an order that does not belongs to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
    status: OrderStatus.AWAITING_PAYMENT,
    userId: "leo",
    version: 1,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin('otro-usuario'))
    .send({
      token: "asdasdas",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
    status: OrderStatus.CANCELLED,
    userId: "leo",
    version: 1,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin('leo'))
    .send({
      token: "asdasdas",
      orderId: order.id,
    })
    .expect(400);
});
