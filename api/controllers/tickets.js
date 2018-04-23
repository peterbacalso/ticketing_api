const mongoose = require('mongoose');

const Ticket = require('../models/ticket');

exports.get = (req, res, next) => {
    const id = req.params.ticketId;
    Ticket.findById(id) // Find data in DB that matches this criteria
        .then(result => {
            // Promise instead of callback (why? see https://stackoverflow.com/questions/22539815/arent-promises-just-callbacks)
            result // Check if ticket exists
                ? res.status(200).json({
                      ticket: result,
                      request: {
                          type: 'GET',
                          description: 'Get all tickets',
                          url:
                              'http://localhost:' +
                              process.env.PORT +
                              '/tickets'
                      }
                  })
                : res.status(404).json({
                      message: 'No valid entry found for provided ID'
                  });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.get_all = (req, res, next) => {
    console.log(req.query);
    Ticket.find(req.query)
        .then(results => {
            const response = {
                count: results.length,
                tickets: results.map(result => {
                    return {
                        _id: result._id,
                        faculty_id: result.faculty_id,
                        applicant_id: result.applicant_id,
                        status: result.status,
                        status_history: result.status_history,
                        ticket_type: result.ticket_type,
                        note: result.note,
                        request: {
                            type: 'GET',
                            url:
                                'http://localhost:' +
                                process.env.PORT +
                                '/tickets/' +
                                result._id
                        }
                    };
                })
            };
            results // Check if tickets exist
                ? res.status(200).json(response)
                : res.status(404).json({
                      message: 'No entries found'
                  });
        })
        .catch(err => {
            // Catch any errors that may occur before this point
            res.status(500).json({
                error: err
            });
        });
};

exports.create = (req, res, next) => {

	const ticket = new Ticket({
		_id: new mongoose.Types.ObjectId(), //Mongoose function that generates a unique ID
		faculty_id: req.body.faculty_id,
		applicant_id: req.body.applicant_id,
		status: req.body.status,
		status_history: req.body.status_history,
		creation_date: req.body.date,
		ticket_type: req.body.ticket_type,
        note: req.body.note,
	});
	// if (req.session.role == 'Budget Director' || req.session.role == 'Associate Chair graduate') {
		ticket
			.save() // Store data into the DB
			.then(result => {
			      	res.status(201).json({
						message: 'Ticket created successfully',
						createdTicket: {
							_id: result._id,
							faculty_id: result.faculty_id,
							applicant_id: result.applicant_id,
							status: result.status,
							status_history: result.status_history,
							ticket_type: result.ticket_type,
                            note: result.note,
							request: {
								type: 'GET',
								url: 'http://localhost:' + process.env.PORT + '/tickets/' + result._id
							}
						}
					});
			      })
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
	// } else {
	// 	res.status(401).json({
	// 		error: {
	// 			message: 'Unauthorized User'
	// 		}
	// 	});
	// }
};

exports.create_batch = (req, res, next) => {
	const num_tickets = req.params.num_tickets;
	const ticket_batch = [];
	for (i = 0; i < num_tickets; i++) {
		var ticket = new Ticket({
			_id: new mongoose.Types.ObjectId(),
			faculty_id: req.body.faculty_id,
			applicant_id: req.body.applicant_id,
			status: req.body.status,
			status_history: req.body.status_history,
			creation_date: req.body.date,
			ticket_type: req.body.ticket_type,
            note: req.body.note,
		});
		ticket_batch.push(ticket);
	}
	// if (req.session.role == 'Budget Director' || req.session.role == 'Associate Chair graduate') {
		Ticket
			.insertMany(ticket_batch)
			.then(results => {
				const response = { // Format the response
					count: results.length,
					tickets: results.map(result => {
						return {
							_id: result._id,
							faculty_id: result.faculty_id,
							applicant_id: result.applicant_id,
							status: result.status,
							status_history: req.body.status_history,
							ticket_type: result.ticket_type,
                            note: result.note,
							request: {
								type: 'GET',
								url: 'http://localhost:' + process.env.PORT + '/tickets/'
							}
						}
					})
				};
			    res.status(201).json(response);
	      	})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
	// } else {
	// 	res.status(401).json({
	// 		error: {
	// 			message: 'Unauthorized User'
	// 		}
	// 	});
	// }
};

exports.update = (req, res, next) => {
    const id = req.params.ticketId;
    const update_fields = {}; // Make update iterable so can update none, some, or all fields
    var status_log = {};
    var note = {};
    for (const field of req.body) {
        if (field.fieldName != 'status_history' && field.fieldName != 'note')
            update_fields[field.fieldName] = field.value;
        if (field.fieldName == 'status')
            status_log = { status: field.value, update_date: new Date() };
        if (field.fieldName == 'note') {
            note = { comment: field.value, post_date: new Date() };
            console.log(note);
            console.log(Object.keys(note).length > 0 && note.constructor === Object);
        }
    }
    var updates = {};
    if (
        Object.keys(update_fields).length > 0 &&
        update_fields.constructor === Object
    ) {
        updates = { $set: update_fields };
        if (
            Object.keys(status_log).length > 0 &&
            status_log.constructor === Object
        ) {
            updates = {
                $set: update_fields,
                $push: { status_history: status_log }
            };
            if (Object.keys(note).length > 0 && note.constructor === Object) {
                console.log('test', note);
                updates = {
                    $set: update_fields,
                    $push: { status_history: status_log, note: note }
                };
            }
        } else {
            if (Object.keys(note).length > 0 && note.constructor === Object) {
                console.log('test', note);
                updates = {
                    $set: update_fields,
                    $push: { note: note }
                };
            }
        }
    } else {
        if (
            Object.keys(status_log).length > 0 &&
            status_log.constructor === Object
        ) {
            updates = {
                $push: { status_history: status_log }
            };
            if (Object.keys(note).length > 0 && note.constructor === Object) {
                console.log('test', note);
                updates = {
                    $push: { status_history: status_log, note: note }
                };
            }
        } else {
            if (Object.keys(note).length > 0 && note.constructor === Object) {
                console.log('test', note);
                updates = {
                    $push: { note: note }
                };
            }
        }
    }
    Ticket.update({ _id: id }, updates, { upsert: true, runValidators: true }) // Update data in DB
        .then(result => {
            res.status(200).json({
                message: 'Ticket updated',
                request: {
                    type: 'GET',
                    url:
                        'http://localhost:' +
                        process.env.PORT +
                        '/tickets/' +
                        id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.update_by_faculty = (req, res, next) => {
    const id = req.params.facultyId;
    const update_fields = {}; // Make update iterable so can update none, some, or all fields
    var status_log = {};
    for (const field of req.body) {
        if (field.fieldName != 'status_history')
            update_fields[field.fieldName] = field.value;
        if (field.fieldName == 'status')
            status_log = { status: field.value, update_date: new Date() };
        if (field.fieldName == 'note')
            note = { comment: field.value, post_date: new Date() };
    }
    var updates = {};
    var updates = {};
    if (
        Object.keys(update_fields).length > 0 &&
        update_fields.constructor === Object
    ) {
        updates = { $set: update_fields };
        if (
            Object.keys(status_log).length > 0 &&
            status_log.constructor === Object
        ) {
            updates = {
                $set: update_fields,
                $push: { status_history: status_log }
            };
            if (Object.keys(note).length > 0 && note.constructor === Object) {
                console.log('test', note);
                updates = {
                    $set: update_fields,
                    $push: { status_history: status_log, note: note }
                };
            }
        } else {
            if (Object.keys(note).length > 0 && note.constructor === Object) {
                console.log('test', note);
                updates = {
                    $set: update_fields,
                    $push: { note: note }
                };
            }
        }
    } else {
        if (
            Object.keys(status_log).length > 0 &&
            status_log.constructor === Object
        ) {
            updates = {
                $push: { status_history: status_log }
            };
            if (Object.keys(note).length > 0 && note.constructor === Object) {
                console.log('test', note);
                updates = {
                    $push: { status_history: status_log, note: note }
                };
            }
        } else {
            if (Object.keys(note).length > 0 && note.constructor === Object) {
                console.log('test', note);
                updates = {
                    $push: { note: note }
                };
            }
        }
    }
    Ticket.update({ faculty_id: id }, updates, {
        multi: true,
        upsert: true,
        runValidators: true
    })
        .then(results => {
            res.status(200).json({
                message: results.n + ' Ticket(s) updated',
                request: {
                    type: 'GET',
                    url:
                        'http://localhost:' +
                        process.env.PORT +
                        '/tickets/faculty/' +
                        id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.delete = (req, res, next) => {
	// if (req.session.role == 'Budget Director') {
		const id = req.params.ticketId;
		Ticket
			.remove({_id: id}) // Remove any object that fulfills this criteria
			.then(result => {
				res.status(200).json({
					message: 'Ticket Deleted',
					request: {
						type: 'POST',
						url: 'http://localhost:' + process.env.PORT + '/tickets',
						body: { faculty_id: 'String', ticket_type: "{ type: String, enum: ['D', 'I'] }" }
					}
				});
			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
	// } else {
	// 	res.status(401).json({
	// 		error: {
	// 			message: 'Unauthorized User'
	// 		}
	// 	});
	// }
};

exports.delete_all = (req, res, next) => {
	// if (req.session.role == 'Budget Director') {
		Ticket
			.remove(req.query)
			.then(result => {
				res.status(200).json({
					message: result.n + ' Ticket(s) Deleted',
					request: {
						type: 'POST',
						url: 'http://localhost:' + process.env.PORT + '/tickets',
						body: { faculty_id: 'String', ticket_type: "{ type: String, enum: ['D', 'I'] }" }
					}
				});
			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
	// } else {
	// 	res.status(401).json({
	// 		error: {
	// 			message: 'Unauthorized User'
	// 		}
	// 	});
	// }
};
