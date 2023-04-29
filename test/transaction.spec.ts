import { describe, it, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { exec, execSync } from 'node:child_process'

describe('Transactions routes', () => {
  beforeAll( async () => {
    await app.ready()
  })

  afterAll( async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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

  it ('should list a transaction by id', async () => {
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

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const transactionResponse = await request(app.server)
    .get(`/transactions/${transactionId}`)
    .set("Cookie", cookies)

    expect(transactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Air Fryer',
        amount: 400
      })
    )
  })
})

