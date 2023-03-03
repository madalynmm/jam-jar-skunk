const mysql = require('mysql2');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    // TODO: Add MySQL Password & look up way to hide it
    password: '',
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
);

// put in something to call 'db' 
// possibly module.exports ???