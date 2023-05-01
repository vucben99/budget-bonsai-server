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
