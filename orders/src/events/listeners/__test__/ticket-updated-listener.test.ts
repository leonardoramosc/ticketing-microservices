import mongoose from "mongoose"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"
import { Ticket } from "../../../models/ticket"
import { TicketUpdatedEvent } from "@microservices-tickets-course/common"

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })

  await ticket.save()

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Lil supa concert',
    price: 30,
    userId: 'user-id'
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, ticket }
}

it('finds, updates, and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('does not call acks if the event has a skipped version number', async () => {
  const { listener, data, msg, ticket } = await setup()

  data.version = data.version + 2

  await expect(listener.onMessage(data, msg)).rejects.toEqual(new Error('Ticket not found'))

  expect(msg.ack).not.toHaveBeenCalled()
})