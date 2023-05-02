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

describe('GET /api/categories', () => {
  beforeAll(connect)
  beforeEach(cleanData)
  beforeEach(addTestUserToDB)
  afterAll(disconnect)

  it('should return status 200 and all categories of the authenticated user', async () => {
    // Given
    const token = FakeUserJWT

    // --- Mock categories in the database
    const categories = [
      {
        name: 'Category 1',
        _id: '60eb9c9a75636100127a0531'
      },
      {
        name: 'Category 2',
        _id: '60eb9c9a75636100127a0532'
      },
      {
        name: 'Category 3',
        _id: '60eb9c9a75636100127a0533'
      }
    ]

    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { categories } },
      { new: true }
    )

    // When
    const response = await request(app).get('/api/categories').set({ Authorization: `Bearer ${token}` })

    // Then
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(3)
    expect(response.body[0]).toMatchObject({
      name: 'Category 1',
      _id: '60eb9c9a75636100127a0531'
    })
    expect(response.body[1]).toMatchObject({
      name: 'Category 2',
      _id: '60eb9c9a75636100127a0532'
    })
    expect(response.body[2]).toMatchObject({
      name: 'Category 3',
      _id: '60eb9c9a75636100127a0533'
    })
  })

  it('should return status 401 when client does not send token', async () => {
    // Given
    // -- No auth header

    // When
    const response = await request(app).get('/api/categories')

    // Then
    expect(response.status).toBe(401)
  })

  it('should return status 403 when client sends invalid token', async () => {
    // Given
    const token = 'invalid token'

    // When
    const response = await request(app).get('/api/categories').set({ Authorization: `Bearer ${token}` })

    // Then
    expect(response.status).toBe(403)
  })
})

describe('POST /api/categories', () => {
  beforeAll(connect)
  beforeEach(cleanData)
  beforeEach(addTestUserToDB)
  afterAll(disconnect)

  const FakeUserJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Ihqwpjj9-exyi9zupZ5mmam_E6cups5oDJ0LpJTp4Ho'

  it('should return status 201 and the created category with an \'_id\' when the user is authenticated', async () => {
    // Given
    const token = FakeUserJWT

    const newCategory = {
      name: 'Category 1'
    }

    // When
    const response = await request(app).post('/api/categories').set({ Authorization: `Bearer ${token}` }).send(newCategory)

    // Then
    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'Category 1',
      _id: expect.any(String)
    })
  })

  it('should return status 400 when client sends invalid category', async () => {
    // Given
    const token = FakeUserJWT

    const newCategory = {
      name: ''
    }

    // When
    const response = await request(app).post('/api/categories').set({ Authorization: `Bearer ${token}` }).send(newCategory)

    // Then
    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      error: expect.any(Object)
    })
  })

  it('should return status 401 when client does not send token', async () => {
    // Given
    // -- No auth header
    const newCategory = {
      name: 'Category 1'
    }

    // When
    const response = await request(app).post('/api/categories').send(newCategory)

    // Then
    expect(response.status).toBe(401)
  })

  it('should return status 403 when client sends invalid token', async () => {
    // Given
    const token = 'invalid token'

    const newCategory = {
      name: 'Category 1'
    }

    // When
    const response = await request(app).post('/api/categories').set({ Authorization: `Bearer ${token}` }).send(newCategory)

    // Then
    expect(response.status).toBe(403)
  })
})

describe('PUT /api/categories/:id', () => {
  beforeAll(connect)
  beforeEach(cleanData)
  beforeEach(addTestUserToDB)
  afterAll(disconnect)

  it('should return status 200 and the updated category when the user is authenticated', async () => {
    // Given
    const token = FakeUserJWT

    // --- Mock category in the database
    const categories = [{ name: 'Category 1', _id: '60eb9c9a75636100127a0526' }]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { categories } },
      { new: true }
    )

    const updatedCategory = {
      name: 'Updated category'
    }

    // When
    const response = await request(app).put('/api/categories/60eb9c9a75636100127a0526').set({ Authorization: `Bearer ${token}` }).send(updatedCategory)

    // Then
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      ...updatedCategory,
      _id: '60eb9c9a75636100127a0526'
    })
  })

  it('should return status 400 when client sends invalid category', async () => {
    // Given
    const token = FakeUserJWT

    // --- Mock category in the database
    const categories = [
      {
        name: 'Category 1',
        _id: '60eb9c9a75636100127a0526'
      }
    ]

    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { categories } },
      { new: true }
    )

    const updatedCategory = {
      name: ''
    }

    // When
    const response = await request(app).put('/api/categories/60eb9c9a75636100127a0526').set({ Authorization: `Bearer ${token}` }).send(updatedCategory)

    // Then
    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      error: expect.any(Object)
    })
  })

  it('should return status 401 when client does not send token', async () => {
    // Given
    // -- No auth header

    // --- Mock category in the database
    const categories = [
      {
        name: 'Category 1',
        _id: '60eb9c9a75636100127a0526'
      }
    ]
    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { categories } },
      { new: true }
    )
    const updatedCategory = {
      name: 'Updated category'
    }

    // When
    const response = await request(app).put('/api/categories/60eb9c9a75636100127a0526').send(updatedCategory)

    // Then
    expect(response.status).toBe(401)
  })

  it('should return status 403 when client sends invalid token', async () => {
    // Given
    const token = 'invalid token'

    // --- Mock category in the database
    const categories = [
      {
        name: 'Category 1',
        _id: '60eb9c9a75636100127a0526'
      }
    ]

    const user = await User.findOneAndUpdate(
      { sub: '1234567890' },
      { $set: { categories } },
      { new: true }
    )

    const updatedCategory = {
      name: 'Updated category'
    }

    // When
    const response = await request(app).put('/api/categories/60eb9c9a75636100127a0526').set({ Authorization: `Bearer ${token}` }).send(updatedCategory)

    // Then
    expect(response.status).toBe(403)
  })
})