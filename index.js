const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require("console.table");
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    // TODO: Add MySQL Password & look up way to hide it
    password: 'toulouse',
    database: 'employees_db'
  },
  console.log('Connected to the employees_db database.')
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

  function addEmployee() {
    db.query('SELECT title FROM roles', function (err, results) {
      if (err) throw err;
      const titleChoices = results.map(object => object.title);

    db.query('SELECT CONCAT(first_name, " ", last_name) AS manager FROM employee', function (err, results) {
      if (err) throw err;
      const managerChoices = results.map(object => object.manager);
      managerChoices.push("None");
    
      inquirer.prompt([
        {
          type: 'input',
          name: 'newFirstName',
          message: "What is the employee's first name?",
          validate: (answer) => {
            if (answer !== '') {
              return true;
            }
            return 'Please enter at least one character.';
          }
        },
        {
          type: 'input',
          name: 'newLastName',
          message: "What is the employee's last name?",
          validate: (answer) => {
            if (answer !== '') {
              return true;
            }
            return 'Please enter at least one character.';
          }
        },
        {
          type: 'list',
          name: 'role',
          message: "What is the employee's role?",
          choices: titleChoices,
        },
        {
          type: 'list',
          name: 'manager',
          message: "Who is the employee's manager?",
          choices: managerChoices
        }
      ])
      .then((answers) => {
        if (answers.manager === "None") {
          db.query(`SELECT id FROM roles WHERE title = '${answers.role}'`, function (err, results) {
            if (err) throw err;
            db.query(`INSERT INTO employee(first_name, last_name, roles_id, manager_id)
                      VALUES ('${answers.newFirstName}', '${answers.newLastName}', 
                              '${results[0].id}', NULL)`);
            console.log(`"Added ${answers.newFirstName + ' ' + answers.newLastName} to employees."`);
          });
        } else {
            const managerFirstName = answers.manager.split(' ').shift();
            // console.log(managerFirstName);

            const managerLastName = answers.manager.split(' ').pop();
            // console.log(managerLastName);

            db.query(`SELECT id FROM employee WHERE first_name = '${managerFirstName}' AND last_name = '${managerLastName}'`, function (err, results) {
              if (err) throw err;
              const managerIdResult = results[0].id;
              // console.log(managerIdResult);

              db.query(`SELECT id FROM roles WHERE title = '${answers.role}'`, function (err, results) {
                if (err) throw err;
                db.query(`INSERT INTO employee(first_name, last_name, roles_id, manager_id)
                          VALUES ('${answers.newFirstName}', '${answers.newLastName}', 
                                  '${results[0].id}', '${managerIdResult}')`);
                console.log(`"Added ${answers.newFirstName + ' ' + answers.newLastName} to employees."`);
            });
          });
        }

        setTimeout(() => {
          mainMenu();
        }, 1000);      
      })
    });
    });
  };

  function updateEmployeeRole() {
    db.query('SELECT CONCAT(first_name, " ", last_name) AS employee FROM employee', function (err, results) {
      if (err) throw err;
      const employeeChoices = results.map(object => object.employee);

      db.query('SELECT title FROM roles', function (err, results) {
        if (err) throw err;
        const titleChoices = results.map(object => object.title);

        inquirer.prompt([
          {
            type: 'list',
            name: 'chooseEmployee',
            message: "Which employee's role would you like to update?",
            choices: employeeChoices
          },
          {
            type: 'list',
            name: 'updateRole',
            message: "Which role do you want to assign the selected employee?",
            choices: titleChoices
          }
        ])
        .then((answer) => {
          const employeeFirstName = answer.chooseEmployee.split(' ').shift();
          const employeeLastName = answer.chooseEmployee.split(' ').pop();
          
          db.query(`SELECT id FROM employee WHERE first_name = '${employeeFirstName}' AND last_name = '${employeeLastName}'`, function (err, results) {
            if (err) throw err;
            const employeeIdResult = results[0].id;

            db.query(`SELECT id FROM roles WHERE title = '${answer.updateRole}'`, function (err, results) {
              if (err) throw err;
              const newRoleResult = results[0].id;

              db.query(`UPDATE employee SET roles_id = '${newRoleResult}' WHERE id = '${employeeIdResult}'`)
                console.log("Updated employee's role.");
              });
            });  
          setTimeout(() => {
            mainMenu();
          }, 1000);      
        })
      });
    });
  };

  function viewRoles() {
    db.query('SELECT r.title, r.id, d.name AS department, r.salary FROM roles r JOIN department d ON r.department_id = d.id ORDER BY r.id', function (err, results) {
      if (err) throw err;
      console.table(results);
    })
    setTimeout(() => {
      mainMenu();
    }, 5000); 
  };

  function addRole() {
    db.query('SELECT name FROM department', function (err, results) {
      if (err) throw err;
      inquirer.prompt([
        {
          type: 'input',
          name: 'roleName',
          message: "What is the name of the role?",
          validate: (answer) => {
            if (answer !== '') {
              return true;
            }
            return 'Please enter at least one character.';
          }
        },
        {
          type: 'input',
          name: 'roleSalary',
          message: "What is the salary of the role?",
          validate: (answer) => {
            const pass = answer.match(/^[1-9]\d*$/);
            if (pass) {
              return true;
            }
            return 'Please enter a positive number greater than zero.';
          },
        },
        {
          type: 'list',
          name: 'dept',
          message: "What department does the role belong to?",
          choices: results,
        }
      ])
      .then((answers) => {
        db.query(`SELECT id FROM department WHERE name = '${answers.dept}'`, function (err, results) {
          db.query(`INSERT INTO roles (title, salary, department_id) VALUES ('${answers.roleName}', '${answers.roleSalary}', '${results[0].id}')`, function (err, results) {
            if (err) throw err;
            console.log(`"Added ${answers.roleName} to ${answers.dept}."`);
          })
          setTimeout(() => {
            mainMenu();
          }, 1000);      
        })
      })
    });
  };


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
      const newDeptName = answer.newDepartment;
      db.query(`INSERT INTO department (name) VALUES ('${newDeptName}')`, function (err, results) {
        if (err) throw err;
        console.log(`"Added ${newDeptName} department."`);
      })
      setTimeout(() => {
        mainMenu();
      }, 1000);      
    })
  };

  mainMenu();
}
appRun();