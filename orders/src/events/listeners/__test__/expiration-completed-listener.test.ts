import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompletedListener } from "../expiration-completed-listener";
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompletedEvent } from "@microservices-tickets-course/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new ExpirationCompletedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();
  const order = Order.build({
    status: OrderStatus.CREATED,
    userId: "12345",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompletedEvent["data"] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { order, ticket, data, listener, msg };
};

it("updates the order status to cancelled", async () => {
  const { order, data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it("emit an order cancelled event", async () => {
  const { order, ticket, data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});
