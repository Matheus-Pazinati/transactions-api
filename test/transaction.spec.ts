import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll( async () => {
    await app.ready()
  })

  afterAll( async () => {
    await app.close()
  })

  it('should create new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Air Fryer',
        amount: 400,
        type: 'debt'
      })
      .expect(201)
  })

  it ('should list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'Air Fryer',
      amount: 400,
      type: 'credit'
    })

    const cookies = createTransactionResponse.headers['set-cookie']

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set("Cookie", cookies)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Air Fryer',
        amount: 400
      })
    ])

  })
})

