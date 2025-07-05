const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { validateTask, validateTaskQuery, validateId } = require('../middleware/validation');

// GET /api/tasks - Retrieve all tasks with filtering and sorting
router.get('/', validateTaskQuery, async (req, res, next) => {
  try {
    const { 
      category, 
      status, 
      priority, 
      search, 
      sortBy = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // Build where clause
    const where = {};
    
    if (category) {
      where.categoryId = category;
    }
    
    if (status === 'completed') {
      where.completed = true;
    } else if (status === 'pending') {
      where.completed = false;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = order;

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - Retrieve a single task by ID
router.get('/:id', validateId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create a new task
router.post('/', validateTask, async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, categoryId } = req.body;

    // Validate category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      
      if (!category) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Category not found'
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update an existing task
router.put('/:id', validateId, validateTask, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed, dueDate, priority, categoryId } = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found'
      });
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      
      if (!category) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Category not found'
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        completed: completed !== undefined ? completed : existingTask.completed,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || existingTask.priority,
        categoryId: categoryId !== undefined ? categoryId : existingTask.categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', validateId, async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found'
      });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;