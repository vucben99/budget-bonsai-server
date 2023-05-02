import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { User, CategoryType } from '../models/User'
import authenticateRequest from '../middleware/authenticateRequest'
import verifyRequestSchema from '../middleware/verifyRequestSchema'

// /api/categories route
const router = express.Router()

// Schema for request validation
const CategorySchema = z.object({
  name: z.string().min(1).max(25),
})

// Get all transaction categories
router.get('/', authenticateRequest, async (req: Request, res: Response) => {
  const user = await User.findOne({ sub: res.locals.user })
  if (!user) return res.sendStatus(500)
  const categories = user.categories
  res.json(categories)
})

// Add a new category
router.post('/', [authenticateRequest, verifyRequestSchema(CategorySchema)], async (req: Request, res: Response) => {
  const sub = res.locals.user
  const category = req.body as CategoryType
  const _id = new mongoose.Types.ObjectId()
  const user = await User.findOneAndUpdate(
    { sub },
    { $push: { categories: { ...category, _id } } },
    { new: true }
  )
  if (!user) return res.sendStatus(500)
  const newCategory = user.categories[user.categories.length - 1]
  res.status(201).json(newCategory)
})

// Update a category
router.put('/:id', [authenticateRequest, verifyRequestSchema(CategorySchema)], async (req: Request, res: Response) => {
  const categoryID = req.params.id as unknown
  const sub = res.locals.user
  const { name } = req.body as CategoryType
  try {
    const user = await User.findOneAndUpdate({ sub, 'categories._id': categoryID }, {
      $set: {
        'categories.$.name': name,
      }
    }, { new: true })

    if (!user) return res.sendStatus(404)

    const updatedCategory = user.categories.find(category => category._id == categoryID)
    res.json(updatedCategory)
  } catch (err) {
    console.error(err)
    res.sendStatus(404)
  }
})

// Delete a category
router.delete('/:id', authenticateRequest, async (req: Request, res: Response) => {
  const sub = res.locals.user
  const id = req.params.id
  try {
    const user = await User.findOneAndUpdate(
      { sub, 'categories._id': id },
      { $pull: { categories: { _id: id } } },
      { new: true }
    )
    if (!user) return res.sendStatus(404)
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(404)
    /* NOTE: If the format of the id is invalid in the URL, it will throw an error, so I should return 500.
    If the id format is correct but it is not found in DB, it will return 404.
    So it looks nicer and it's easier to handle to always return 404 to the client. */
  }
})

export default router