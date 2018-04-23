const express = require('express');
const router = express.Router();

const TicketsController = require('../controllers/tickets');

// Get a ticket by ID
router.get('/:ticketId', TicketsController.get);

// Get all tickets
router.get('/', TicketsController.get_all);

// Create a ticket
router.post('/', TicketsController.create);

// Create a batch of tickets
router.post('/:num_tickets', TicketsController.create_batch);

// Update a ticket by ID
router.patch('/:ticketId', TicketsController.update);

// Update tickets by faculty
router.patch('/faculty/:facultyId', TicketsController.update_by_faculty);

// Delete a ticket by ID
router.delete('/:ticketId', TicketsController.delete);

// Delete all tickets
router.delete('/', TicketsController.delete_all);

module.exports = router;