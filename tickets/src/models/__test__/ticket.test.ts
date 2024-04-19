import { Ticket } from "../ticket"

it('implements optimistic concurrency control', async () => {
  const ticket = Ticket.build({
    title: 'cocnert',
    price: 5,
    userId: '123'
  })

  await ticket.save()

  const firsIntance = await Ticket.findById(ticket.id)
  const secondIntance = await Ticket.findById(ticket.id)

  firsIntance!.set({ price: 10 })
  secondIntance!.set({ price: 15 })

  await firsIntance!.save()

  try {
    await secondIntance!.save()
  } catch (error) {
    return;
  }

  throw new Error('should not reach this point')
})

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123'
  })

  await ticket.save()
  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)
})