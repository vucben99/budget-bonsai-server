import dotenv from 'dotenv'
dotenv.config()
import request from 'supertest'
import {
  connect,
  cleanData,
  disconnect,
  addTestUserToDB
} from '../mongodb-memory-server/mongodb.memory.test.helper'
import app from '../app'
import { User } from '../models/User'

const FakeUserJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Ihqwpjj9-exyi9zupZ5mmam_E6cups5oDJ0LpJTp4Ho'

describe('GET /api/transactions', () => {
  beforeAll(connect)
  beforeEach(cleanData)
  beforeEach(addTestUserToDB)
  afterAll(disconnect)

  it('should return status 200 and all transactions of the authenticated user, sorted by date in descending order', async () => {
    // Given
    const token = FakeUserJWT

    // --- Mock transactions in the database
    const transactions = [
      {
        name: 'Transaction 1',
        amount: 350000,
        type: 'income',
        currency: 'HUF',
        category: 'Salary',
        date: '2022-01-01T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0526'
      },
      {
        name: 'Transaction 2',
        amount: 2000,
        type: 'expense',
        currency: 'HUF',
        category: 'Food',
        date: '2022-01-02T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0527'
      },
      {
        name: 'Transaction 3',
        amount: 1500,
        type: 'income',
        currency: 'EUR',
        category: 'Bonus',
        date: '2022-01-03T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0528'
      }
    ]

    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { transactions } },
      { new: true }
    )

    // When
    const response = await request(app).get('/api/transactions').set({ Authorization: `Bearer ${token}` })

    // Then
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(3)
    expect(response.body[0]).toMatchObject({
      name: 'Transaction 3',
      amount: 1500,
      type: 'income',
      currency: 'EUR',
      category: 'Bonus',
      date: '2022-01-03T00:00:00.000Z',
      _id: '60eb9c9a75636100127a0528'
    })
    expect(response.body[1]).toMatchObject({
      name: 'Transaction 2',
      amount: 2000,
      type: 'expense',
      currency: 'HUF',
      category: 'Food',
      date: '2022-01-02T00:00:00.000Z',
      _id: '60eb9c9a75636100127a0527'
    })
    expect(response.body[2]).toMatchObject({
      name: 'Transaction 1',
      amount: 350000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-01T00:00:00.000Z',
      _id: '60eb9c9a75636100127a0526'
    })
  })

  it('should return status 401 when client does not send token', async () => {
    // Given
    // -- No auth header

    // When
    const response = await request(app).get('/api/transactions')

    // Then
    expect(response.status).toBe(401)
  })

  it('should return status 403 when client sends invalid token', async () => {
    // Given
    const token = 'invalid token'

    // When
    const response = await request(app).get('/api/transactions').set({ Authorization: `Bearer ${token}` })

    // Then
    expect(response.status).toBe(403)
  })
})

describe('POST /api/transactions', () => {
  beforeAll(connect)
  beforeEach(cleanData)
  beforeEach(addTestUserToDB)
  afterAll(disconnect)

  const FakeUserJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Ihqwpjj9-exyi9zupZ5mmam_E6cups5oDJ0LpJTp4Ho'

  it('should return status 201 and the created transaction with an \'_id\' when the user is authenticated', async () => {
    // Given
    const token = FakeUserJWT

    const newTransaction = {
      name: 'Transaction 1',
      amount: 350000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-01T00:00:00.000Z'
    }

    // When
    const response = await request(app).post('/api/transactions').set({ Authorization: `Bearer ${token}` }).send(newTransaction)

    // Then
    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'Transaction 1',
      amount: 350000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-01T00:00:00.000Z',
      _id: expect.any(String)
    })
  })

  it('should return status 400 when client sends invalid transaction', async () => {
    // Given
    const token = FakeUserJWT

    const newTransaction = {
      name: '',
      amount: 0,
      type: '',
      currency: '',
      category: '',
      date: ''
    }

    // When
    const response = await request(app).post('/api/transactions').set({ Authorization: `Bearer ${token}` }).send(newTransaction)

    // Then
    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      error: expect.any(Object)
    })
  })

  it('should return status 401 when client does not send token', async () => {
    // Given
    // -- No auth header
    const newTransaction = {
      name: 'Transaction 1',
      amount: 350000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-01T00:00:00.000Z'
    }

    // When
    const response = await request(app).post('/api/transactions').send(newTransaction)

    // Then
    expect(response.status).toBe(401)
  })

  it('should return status 403 when client sends invalid token', async () => {
    // Given
    const token = 'invalid token'

    const newTransaction = {
      name: 'Transaction 1',
      amount: 350000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-01T00:00:00.000Z'
    }

    // When
    const response = await request(app).post('/api/transactions').set({ Authorization: `Bearer ${token}` }).send(newTransaction)

    // Then
    expect(response.status).toBe(403)
  })
})

describe('PUT /api/transactions/:id', () => {
  beforeAll(connect)
  beforeEach(cleanData)
  beforeEach(addTestUserToDB)
  afterAll(disconnect)

  it('should return status 200 and the updated transaction when the user is authenticated', async () => {
    // Given
    const token = FakeUserJWT

    // --- Mock transaction in the database
    const transactions = [
      {
        name: 'Transaction 1',
        amount: 350000,
        type: 'income',
        currency: 'HUF',
        category: 'Salary',
        date: '2022-01-01T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0526'
      }
    ]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { transactions } },
      { new: true }
    )

    const updatedTransaction = {
      name: 'Updated transaction',
      amount: 400000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-02T00:00:00.000Z'
    }

    // When
    const response = await request(app).put('/api/transactions/60eb9c9a75636100127a0526').set({ Authorization: `Bearer ${token}` }).send(updatedTransaction)

    // Then
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      ...updatedTransaction,
      _id: '60eb9c9a75636100127a0526'
    })
  })

  it('should return status 400 when client sends invalid transaction', async () => {
    // Given
    const token = FakeUserJWT

    // --- Mock transaction in the database
    const transactions = [
      {
        name: 'Transaction 1',
        amount: 350000,
        type: 'income',
        currency: 'HUF',
        category: 'Salary',
        date: '2022-01-01T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0526'
      }
    ]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { transactions } },
      { new: true }
    )

    const updatedTransaction = {
      name: '',
      amount: 0,
      type: '',
      currency: '',
      category: '',
      date: ''
    }

    // When
    const response = await request(app).put('/api/transactions/60eb9c9a75636100127a0526').set({ Authorization: `Bearer ${token}` }).send(updatedTransaction)

    // Then
    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      error: expect.any(Object)
    })
  })

  it('should return status 401 when client does not send token', async () => {
    // Given
    // -- No auth header

    // --- Mock transaction in the database
    const transactions = [
      {
        name: 'Transaction 1',
        amount: 350000,
        type: 'income',
        currency: 'HUF',
        category: 'Salary',
        date: '2022-01-01T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0526'
      }
    ]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { transactions } },
      { new: true }
    )
    const updatedTransaction = {
      name: 'Updated transaction',
      amount: 400000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-02T00:00:00.000Z'
    }

    // When
    const response = await request(app).put('/api/transactions/60eb9c9a75636100127a0526').send(updatedTransaction)

    // Then
    expect(response.status).toBe(401)
  })

  it('should return status 403 when client sends invalid token', async () => {
    // Given
    const token = 'invalid token'


    // --- Mock transaction in the database
    const transactions = [
      {
        name: 'Transaction 1',
        amount: 350000,
        type: 'income',
        currency: 'HUF',
        category: 'Salary',
        date: '2022-01-01T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0526'
      }
    ]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { transactions } },
      { new: true }
    )
    const updatedTransaction = {
      name: 'Updated transaction',
      amount: 400000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-02T00:00:00.000Z'
    }

    // When
    const response = await request(app).put('/api/transactions/60eb9c9a75636100127a0526').set({ Authorization: `Bearer ${token}` }).send(updatedTransaction)

    // Then
    expect(response.status).toBe(403)
  })
  it('should return status 404 when the transaction does not exist', async () => {
    // Given
    const token = FakeUserJWT

    const updatedTransaction = {
      name: 'Updated transaction',
      amount: 400000,
      type: 'income',
      currency: 'HUF',
      category: 'Salary',
      date: '2022-01-02T00:00:00.000Z'
    }

    // When
    const response = await request(app).put('/api/transactions/NON_EXISTENT_TRANSACTION').set({ Authorization: `Bearer ${token}` }).send(updatedTransaction)

    // Then
    expect(response.status).toBe(404)
  })
})

describe('DELETE /api/transactions/:id', () => {
  beforeAll(connect)
  beforeEach(cleanData)
  beforeEach(addTestUserToDB)
  afterAll(disconnect)

  it('should return status 200 when the user is authenticated', async () => {
    // Given
    const token = FakeUserJWT

    // --- Mock transaction in the database
    const transactions = [
      {
        name: 'Transaction 1',
        amount: 350000,
        type: 'income',
        currency: 'HUF',
        category: 'Salary',
        date: '2022-01-01T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0526'
      }
    ]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { transactions } },
      { new: true }
    )

    // When
    const response = await request(app).delete('/api/transactions/60eb9c9a75636100127a0526').set({ Authorization: `Bearer ${token}` })

    // Then
    expect(response.status).toBe(200)
  })

  it('should return status 401 when client does not send token', async () => {
    // Given
    // -- No auth header

    // --- Mock transaction in the database
    const transactions = [
      {
        name: 'Transaction 1',
        amount: 350000,
        type: 'income',
        currency: 'HUF',
        category: 'Salary',
        date: '2022-01-01T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0526'
      }
    ]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { transactions } },
      { new: true }
    )

    // When
    const response = await request(app).delete('/api/transactions/60eb9c9a75636100127a0526')

    // Then
    expect(response.status).toBe(401)
  })

  it('should return status 403 when client sends invalid token', async () => {
    // Given
    const token = 'invalid token'

    // --- Mock transaction in the database
    const transactions = [
      {
        name: 'Transaction 1',
        amount: 350000,
        type: 'income',
        currency: 'HUF',
        category: 'Salary',
        date: '2022-01-01T00:00:00.000Z',
        _id: '60eb9c9a75636100127a0526'
      }
    ]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { transactions } },
      { new: true }
    )

    // When
    const response = await request(app).delete('/api/transactions/60eb9c9a75636100127a0526').set({ Authorization: `Bearer ${token}` })

    // Then
    expect(response.status).toBe(403)
  })

  it('should return status 404 when the transaction does not exist', async () => {
    // Given
    const token = FakeUserJWT

    // When
    const response = await request(app).delete('/api/transactions/NON_EXISTENT_TRANSACTION').set({ Authorization: `Bearer ${token}` })

    // Then
    expect(response.status).toBe(404)
  })
})