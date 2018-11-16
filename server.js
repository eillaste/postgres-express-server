let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let pg = require('pg');
const cors = require('cors');
const PORT = 3000;

let pool = new pg.Pool({
	port: 5432,
	password: 'rebane',
	database: 'countries',
	max: 10,
	host: 'localhost',
	user: 'postgres'
});

// pool.connect((err, db, done) => {
// 	if (err) {
// 		return console.log(err);
// 	} else {
// 		var country_name = 'Spain';
// 		var continent_name = 'Europe';
// 		var id = Math.random().toFixed(3);
// 		db.query('SELECT * from countries', (err, table) => {
// 			if (err) {
// 				return console.log(err);
// 			} else {
// 				console.log(table.rows);
// 			}
// 		});
// 	}
// });

let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use(function(request, response, next) {
	response.header('Access-Control-Allow-Origin', '*');
	response.header('Acess-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.delete('/api/remove/:id', function(request, response) {
	var id = request.params.id;
	pool.connect(function(err, db, done) {
		if (err) {
			return response.status(400).send(err);
		} else {
			db.query('DELETE FROM countries WHERE id = $1', [ id ], function(err, result) {
				done();
				if (err) {
					return response.status(400).send(err);
				} else {
					return response.status(200).send({ message: 'success in deleting record' });
				}
			});
		}
	});
});

app.get('/api/countries', function(request, response) {
	pool.connect(function(err, db, done) {
		if (err) {
			return response.status(400).send(err);
		} else {
			db.query('SELECT * FROM countries', function(err, table) {
				if (err) {
					return response.status(400).send(error);
				} else {
					return response.status(200).send(table.rows);
				}
			});
		}
	});
});

app.post('/api/new-country', function(request, response) {
	var country_name = request.body.country_name;
	var continent_name = request.body.continent_name;
	var id = request.body.id;
	let values = [ country_name, continent_name, id ];
	pool.connect((err, db, done) => {
		if (err) {
			return response.status(400).send(err);
		} else {
			db.query(
				'INSERT INTO countries (country_name, continent_name, id) VALUES($1, $2, $3)',
				[ ...values ],
				(err, table) => {
					if (err) {
						return response.status(400).send(err);
					} else {
						console.log('DATA INSERTED');
						response.status(201).send({ message: 'Data inserted!' });
					}
				}
			);
		}
	});
});

app.listen(PORT, () => console.log('Listening on port ' + PORT));
