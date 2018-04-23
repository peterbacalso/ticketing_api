process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let Ticket = require('../api/models/ticket');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app.js');
let should = chai.should();

chai.use(chaiHttp);

// Variables used for testing
let newWrongTicketType = {
    'faculty_id': 'mzaleski',
    'ticket_type': 'Wrong_Type'
};
let newValidTicket = {
    'faculty_id': 'mzaleski',
    'ticket_type': 'D'
};
let newTicket = {
	_id: new mongoose.Types.ObjectId(),
	faculty_id: 'mzaleski',
	ticket_type: 'I'
};
let newValidPatch = [
	{"fieldName": "faculty_id", "value": "pbacals"},
	{"fieldName": "applicant_id", "value": "1000369610"},
];
let newAtLeastOneValidFieldPatch = [
	{"fieldName": "junk", "value": "blah"},
	{"fieldName": "junk1", "value": "blah"},
	{"fieldName": "junk2", "value": "blah"},
	{"fieldName": "faculty_id", "value": "pbacals"},
	{"fieldName": "junk3", "value": "blah"},
];
let newInvalidFieldNamePatch = [
	{"fieldName": "invalid1", "value": "pbacals"},
	{"fieldName": "invalid2", "value": "1000369610"}
];
let newStatusPatch = [
	{"fieldName": "faculty_id", "value": "pbacals"},
	{"fieldName": "applicant_id", "value": "1000000000"},
	{"fieldName": "status", "value": "offer-pending"}
]
describe('Tickets', () => {
    beforeEach((done) => { // Before each test we empty the database
        Ticket.remove({}, (err) => { 
           done();         
        });     
    });

    it('should exist', () => {
        server.should.exist;
    });


    // Test the GET route
    describe('/GET tickets', () => {
	it('it should GET all the tickets', (done) => {
        chai.request(server)
            .get('/tickets')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('count');
                res.body.count.should.be.eql(0);
                res.body.should.have.property('tickets');
                res.body.tickets.should.be.a('array');
                res.body.tickets.length.should.be.eql(0);
                done();
            });
	    });
	});

	// Test the /GET/:id route
	describe('/GET/:id ticket', () => {
		  it('it should GET a ticket by the given id', (done) => {
			let ticket = new Ticket(newTicket);
		    ticket
		    	.save()
		    	.then((ticket) => {
			        chai.request(server)
			        .get('/tickets/' + ticket._id)
			        .end((err, res) => {
				            res.should.have.status(200);
				            res.body.should.be.a('object');
				            res.body.should.have.property('ticket');
				            res.body.ticket.should.have.property('status');
				            res.body.ticket.should.have.property('creation_date');
				            res.body.ticket.should.have.property('status_history');
				            res.body.ticket.status_history.should.be.a('array');
				            res.body.ticket.should.have.property('_id') === (ticket._id);
				            res.body.ticket.should.have.property('faculty_id');
				            res.body.ticket.should.have.property('ticket_type');
				          	done();
                        });
                })
                .catch((err) => {
                    console.log("ERROR: can't insert data in db for testing");
                });
		  });
	});

	// Test the POST routes
    describe('/POST tickets', () => {
		it('it should not POST a ticket with any missing fields', (done) => {
	        chai.request(server)
	            .post('/tickets')
	            .send({})
	            .end((err, res) => {
	                res.should.have.status(500);
	                res.body.should.have.property('error');
	                res.body.error.should.have.property('errors');
	                res.body.error.errors.should.be.a('object');
	                res.body.error.errors.should.have.property('faculty_id');
	                res.body.error.errors.faculty_id.should.have.property('kind').eql('required');
	                res.body.error.errors.should.have.property('ticket_type');
	                res.body.error.errors.ticket_type.should.have.property('kind').eql('required');
	                done();
	            });
	    });
		it('it should not POST a ticket with an invalid ticket type', (done) => {
	        chai.request(server)
	            .post('/tickets')
	            .send(newWrongTicketType)
	            .end((err, res) => {
	                res.should.have.status(500);
	                res.body.should.have.property('error');
	                res.body.error.should.have.property('errors');
	                res.body.error.errors.should.be.a('object');
	                res.body.error.errors.should.have.property('ticket_type');
	                res.body.error.errors.ticket_type.should.have.property('kind').eql('enum');
	                done();
	            });
	    });
		it('it should POST a ticket with valid fields', (done) => {
	        chai.request(server)
	            .post('/tickets')
	            .send(newValidTicket)
	            .end((err, res) => {
	                res.should.have.status(201);
	                res.body.should.have.property('message').eql('Ticket created successfully');
	                done();
	            });
	    });
		it('it should POST 5 tickets with valid fields', (done) => {
	        chai.request(server)
	            .post('/tickets/5')
	            .send(newValidTicket)
	            .end((err, res) => {
	                res.should.have.status(201);
	                res.body.should.be.a('object');
                    res.body.should.have.property('count');
	                res.body.count.should.be.eql(5);
	                res.body.should.have.property('tickets');
	                res.body.tickets.should.a('array');
	                res.body.tickets.length.should.be.eql(5);
	                done();
	            });
	    });
	});

	// Test the /PATCH/:id route
	describe('/PATCH/:id ticket', () => {
		  it('it should UPDATE a ticket by the given id', (done) => {
		        chai.request(server)
			        .patch('/tickets/' + newTicket._id)
			        .send(newValidPatch)
			        .end((err, res) => {
			            res.should.have.status(200);
		                res.body.should.have.property('message').eql('Ticket updated');
			          	done();
		        });
		  });
  		  it('it should UPDATE a ticket by the given id when the patch has at least one valid field', (done) => {
		        chai.request(server)
			        .patch('/tickets/' + newTicket._id)
			        .send(newAtLeastOneValidFieldPatch)
			        .end((err, res) => {
			            res.should.have.status(200);
		                res.body.should.have.property('message').eql('Ticket updated');
			          	done();
		        });
		  });
  		  it('it should UPDATE the ticket status and add a log to the status history', (done) => {
		        chai.request(server)
			        .patch('/tickets/' + newTicket._id)
			        .send(newStatusPatch)
			        .end((err, res) => {
			            res.should.have.status(200);
		                res.body.should.have.property('message').eql('Ticket updated');
			          	done();
		        });
		  });
	});

	// Test the DELETE route
	describe('/DELETE/:id ticket', () => {
		  it('it should DELETE all the tickets', (done) => {
			let ticket = new Ticket(newTicket);
		    ticket
		    	.save()
		    	.then((ticket) => {
			        chai.request(server)
			        .delete('/tickets')
			        .end((err, res) => {
				            res.should.have.status(200);
				            res.body.should.have.property('message').eql('1 Ticket(s) Deleted');
				          	done();
                        });
                })
                .catch((err) => {
                    console.log("ERROR: can't insert data in db for testing");
                });
		  });
	});

	// Test the /DELETE/:id route
	describe('/DELETE/:id ticket', () => {
		  it('it should DELETE a ticket by the given id', (done) => {
			let ticket = new Ticket(newTicket);
		    ticket
		    	.save()
		    	.then((ticket) => {
			        chai.request(server)
			        .delete('/tickets/' + ticket._id)
			        .end((err, res) => {
				            res.should.have.status(200);
				            res.body.should.have.property('message').eql('Ticket Deleted');
				          	done();
                        });
                })
                .catch((err) => {
                    console.log("ERROR: can't insert data in db for testing");
                });
		  });
	});
});



