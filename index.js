const inquirer = require('inquirer');
const mysql = require('mysql2');
// is this needed?
const consoleTable = require("console.table");
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    // TODO: Add MySQL Password & look up way to hide it
    password: 'toulouse',
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
);

console.log(
  '\nEmployee Manager\n'
);

function appRun() {
  function mainMenu() {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'action',
          message: "What would you like to do?",
          choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Close Employee Manager"],
        }
      ])
      .then((answer) => {
        if (answer.action === "View All Employees") {
          viewEmployees();
        } else if (answer.action === "Add Employee") {
          addEmployee();
        } else if (answer.action === "Update Employee Role") {
          updateEmployeeRole();
        } else if (answer.action === "View All Roles") {
          viewRoles();
        } else if (answer.action === "Add Role") {
          addRole();
        } else if (answer.action === "View All Departments") {
          viewDepartments();
        } else if (answer.action === "Add Department") { 
          addDepartment();
        } else {
          process.exit();
        }
      });  
  }

  function viewEmployees() {
    db.query('SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee e JOIN roles r ON e.roles_id = r.id JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON m.id = e.manager_id' , function (err, results) {
      if (err) throw err;
      console.table(results);
    })
    setTimeout(() => {
      mainMenu();
    }, 5000);
  }

  // function addEmployee()

  // function updateEmployeeRole()

  function viewRoles() {
    db.query('SELECT r.title, r.id, d.name AS department, r.salary FROM roles r JOIN department d ON r.department_id = d.id ORDER BY r.id', function (err, results) {
      if (err) throw err;
      console.table(results);
    })
    setTimeout(() => {
      mainMenu();
    }, 5000); 
  }

  // function addRole()

  function viewDepartments() {
    db.query('SELECT * FROM department', function (err, results) {
      if (err) throw err;
      console.table(results);
    })
    setTimeout(() => {
      mainMenu();
    }, 5000);    
  }

  function addDepartment() {
    inquirer.prompt([
      {
        type: 'input',
        name: 'newDepartment',
        message: "What is the name of the department?",
        validate: (answer) => {
          if (answer !== '') {
            return true;
          }
          return 'Please enter at least one character.';
        },
      },
    ])
    .then((answer) => {
      db.query(`INSERT INTO department (name) VALUES ('${answer.newDepartment}')`, function (err, answer) {
        if (err) throw err;
      })
      setTimeout(() => {
        mainMenu();
      }, 5000);    
    })
  }

  mainMenu();
}
appRun();