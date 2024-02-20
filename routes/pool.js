const mysql = require('mysql2');
require('dotenv').config()
console.log(process.env.password)

const pool = mysql.createPool({

  host : process.env.HOST,
 user: process.env.USER,
  password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT,
    multipleStatements: true,
	waitForConnections: true,
  connectionLimit: 100,
  maxIdle: 100, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
  })



  pool.getConnection((err, connection) => {
	if (err) {
	  console.error('Error connecting to the database:', err.message);
	} else {
	  console.log('Connected to the database');
	  connection.release();
	}
   });
   // Handle unexpected errors
   pool.on('error', (err) => {
	console.error('Unexpected database error:', err.message);
	if (err.code === 'PROTOCOL_CONNECTION_LOST') {
	  console.error('Reconnecting to the database...');
	  pool.getConnection((reconnectErr, connection) => {
		if (reconnectErr) {
		  console.error('Reconnection failed:', reconnectErr.message);
		} else {
		  console.log('Reconnected to the database');
		  connection.release();
		}
	  });
	} else {
	  throw err;
	}
   });

   module.exports = pool.promise();


