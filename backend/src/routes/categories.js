const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { validateCategory, validateId } = require('../middleware/validation');

// GET /api/categories - Retrieve all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories - Create a new category
router.post('/', validateCategory, async (req, res, next) => {
  try {
    const { name, color } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        color
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', validateId, validateCategory, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        color
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', validateId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }

    // Check if category has associated tasks
    if (category._count.tasks > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot delete category with ${category._count.tasks} associated tasks. Please reassign or delete the tasks first.`
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
