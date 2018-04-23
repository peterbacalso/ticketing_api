# Ticket Server

A simple RESTful API for querying tickets.

Tools used:

- Express
- Mongoose + MongoDB

Key features:

- Create, Read, Update, Delete (CRUD) tickets
- CRUD tickets in batches
- Query tickets with specific filters

## Quickstart

Clone this repo, then run the commands below from the root directory

```shell
npm install
npm start
```
To run the mocha tests

```shell
npm test
```

The API will be running on localhost:5000

## API endpoints

- `/tickets`: main entrypoint for tickets
- `/tickets/:ticketId`: perform operations on a ticket by its unique `ticketId`
- `/tickets/:num_tickets`: create a batch of tickets
- `/tickets/faculty/:facultyId`: update a batch of tickets owned by a specific `facultyId`

### Examples

### `GET`

- `/tickets/5aad6dbdb2d0332d6299e048`: gets the ticket with id `5aad6dbdb2d0332d6299e048`
- `/tickets`: queries all the tickets
- `/tickets?faculty_id=mzaleski`: queries tickets owned by `mzaleski`
- `/tickets?status=granted&ticket_type=D`: queries domestic tickets that have status `granted`

### `POST`

- `/tickets`: create a new ticket
- `/tickets/5`: creates 5 new tickets

Request.Body:
```json
{
    "faculty_id": "mzaleski",
    "ticket_type": "D"
}
```

### `PATCH`

- `/tickets/5aad6dbdb2d0332d6299e048`: updates the ticket with id `5aad6dbdb2d0332d6299e048`

Updates can be made modularly on a ticket by listing out any desired changes on specified fields in an array format.

Request.Body:
```json
[
	{"fieldName": "faculty_id", "value": "pbacals"},
	{"fieldName": "applicant_id", "value": "1000369610"},
	{"fieldName": "status", "value": "offer-pending"}
	...
]
```

- `tickets/faculty/mzaleski`: updates all tickets owned by a `mzaleski`

Request.Body:
```json
[
	{"fieldName": "ticket_type", "value": "I"},
	{"fieldName": "note", "value": "updated status to granted"},
	{"fieldName": "status", "value": "granted"},
	...
]
```

### `DELETE`

- `/tickets/5aad6dbdb2d0332d6299e048`: deletes a ticket with id `5aad6dbdb2d0332d6299e048`
- `/tickets`: deletes all tickets
- `/tickets?faculty_id=mzaleski`: deletes all tickets owned by `mzaleski`
- `/tickets?status=granted&ticket_type=D`: deletes all domestic tickets that have status `granted`

## Ticket Schema

```js
{
	_id: mongoose.Schema.Types.ObjectId,
	faculty_id: { type: String, required: true },
	applicant_id: Number,
	status: { 
		type: String,
		enum: ['initial', 'granted', 'offer-request', 'offer-pending', 'accepted', 'refused'],
		default: 'initial',
		required: true
	},
	creation_date: { 
		type: Date, 
		default: Date.now
	},
	ticket_type: { 
		type: String, 
		enum: ['D', 'I'],
		uppercase: true,
		required: true 
	},
	status_history: {
		type: [{
			status: { 
				type: String,
				enum: ['initial', 'granted', 'offer-request', 'offer-pending', 'accepted', 'refused']
			},
			update_date: Date
		}],
		default: [{
			status: 'initial',
			update_date: new Date()
		}]
	},
	note: {
		type: [{
			comment: String,
			post_date: Date
		}]
	}
}
```





