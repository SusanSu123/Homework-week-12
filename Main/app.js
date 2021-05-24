const mysql = require('mysql');
const inquirer = require('inquirer');


const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password:'rootroot',
    database: 'employees_db'
})

connection.connect((err) => {
    if (err) throw err;
    options();
  });

function options() {
    inquirer
     .prompt({
        name: 'action',
        type: 'list',
        message: 'Welcome to our employee database! What would you like to do?',
        choices: [
                'View all employees',
                'View all departments',
                'View all roles',
                'Add an employee',
                'Add a department',
                'Add a role',
                'Update employee role',
                'Delete an employee',
                'EXIT'
                ]
     })
     .then(function (answer) {
         switch (answer.action) {
            case 'View all employees':
                viewEmployees();
                break;
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Update employee role':
                updateRole();
                break;
            case 'Delete an employee':
                deleteEmployee();
                break;
            case 'EXIT': 
                exitApp();
                break;
            default:
                break;
         }

     })

};


function viewEmployees() {
    var query = 'SELECT * FROM employee';
    connection.query(query, function(err, res) {
        if (err) throw err;
        console.log(res.length + ' employees found!');
        console.table(res);
        options();
    })
};

function viewDepartments() {
    var query = 'SELECT * FROM department';
    connection.query(query, function(err,res) {
        if (err) throw err;
        console.table(res);
        options();
    })
};

function viewRoles() {
    var query = 'SELECT * FROM role';
    connection.query(query, function(err,res) {
        if (err) throw err;
        console.table(res);
        options();
    })
};

function addEmployee() {
    connection.query('SELECT * FROM role', function (err, res) {
        if (err) throw err;
        inquirer
          .prompt([
            {
                name: 'first_name',
                type: 'input', 
                message: "What is the employee's fist name? ",
            },
            {
                name: 'last_name',
                type: 'input', 
                message: "What is the employee's last name? "
            },
            {
                name: 'manager_id',
                type: 'input', 
                message: "What is the employee's manager's ID? "
            },
            {
                name: 'role_id', 
                type: 'list',
                choices: function() {
                    var roleArray = [];
                    for (let i = 0; i < res.length; i++) {
                        roleArray.push({name: res[i].title, value: res[i].id});
                    }         
                    return roleArray;
                }, 
                message: "What is this employee's role? "
            }
          ])
          .then (function (answer) {
            const query = 'INSERT INTO employee SET ?'
            const employee = {  
                first_name: answer.first_name,
                last_name: answer.last_name,
                role_id: answer.role_id,
                manager_id: answer.manager_id

            }
            connection.query(query, employee, function(err,res) {
                if (err) throw err;
                console.log('New employee has been added!');
            options(); 
            })  
          })
          

    })
}


function addDepartment() {
    inquirer
       .prompt([
            {
                name: 'newDepartment', 
                type: 'input', 
                message: 'Which department would you like to add?'
            },
       ])
       .then(function (answer) {
           connection.query(
            'INSERT INTO department SET ?',
            {
                name: answer.newDepartment
            });
          var query = 'SELECT * FROM department';
          connection.query(query, function(err, res) {
              if (err) throw err;
              console.log('Your department has been added!');
              console.table(res);
              options();
          }) 
       })

};


function addRole() {

    connection.query('SELECT * FROM department', function(err, res) {
        if (err) throw err;

        inquirer
        .prompt([
            {
                name: 'new_role',
                type: 'input', 
                message: "What new role would you like to add?"
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of this role? (Enter a number)'
            },
            {
                name: 'department_id',
                type: 'list',
                choices: function() {
                    var deptArray = [];
                    for (let i = 0; i < res.length; i++) {
                    deptArray.push({name: res[i].title, value: res[i].id});
                    }
                    return deptArray;
                },
            }
        ])
        .then (function (answer) {
            const query = 'INSERT INTO role SET ?'
            let department_id;
            for (let a = 0; a < res.length; a++) {
                if (res[a].name == answer.Department) {
                    department_id = res[a].id;
                }
            }
            const role = {
                title: answer.new_role,
                salary: answer.salary,
                department_id: department_id
                options();
            })
        })
    })

};

function updateRole() {
    connection.query('SELECT * FROM employee', function(err, result) {
        if (err) throw (err);
    inquirer
        .prompt([
          {
            name: "employeeName",
            type: "list",
            message: "Which employee's role is changing?",
            choices: function() {
             employeeArray = [];
                result.forEach(result => {
                    employeeArray.push(
                        result.last_name
                    );
                })
                return employeeArray;
              }
          }
          ]) 
        .then(function(answer) {
        console.log(answer);
        const name = answer.employeeName;
      
        connection.query("SELECT * FROM role", function(err, res) {
                inquirer
                .prompt ([
                    {
                        name: "role",
                        type: "list",
                        message: "What is their new role?",
                        choices: function() {
                            rolesArray = [];
                            res.forEach(res => {
                                rolesArray.push(
                                    res.title)
                                
                            });
                            return rolesArray;
                        }
                    }
                ]).then(function(rolesAnswer) {
                    const role = rolesAnswer.role;
                    console.log(rolesAnswer.role);
                connection.query('SELECT * FROM role WHERE title = ?', [role], function(err, res) {
                if (err) throw (err);
                    let roleId = res[0].id;
                    let query = "UPDATE employee SET role_id ? WHERE last_name ?";
                    let values = [roleId, name]
                    console.log(values);
                     connection.query(query, values,
                         function(err, res, fields) {
                         console.log(`You have updated ${name}'s role to ${role}.`)
                        })
                        viewEmployees();
                        })
                     })
                })
            
      
       })
})

}


function deleteEmployee() {
    console.log('Deleting data');

    connection.query('select * from employee', (err, res) => {
      if (err) throw err;
  
      const employees = res.map(role => ({
        name: `${role.first_name} ${role.last_name}`,
        value: role.id
      }))
  
      inquirer
        .prompt(
          {
            name: 'delete',
            type: 'list',
            message: 'Who would you like to remove?',
            choices: employees,
  
          })
          .then((employee_delete) => {
            connection.query(
              'DELETE FROM employee  WHERE ?', [
              {
                id: employee_delete.delete,
              },
            ],
              (err, res) => {
                if (err) throw err
                console.log('Employee deleted');
                console.table(res)
                options();
              })
          })   
    
    });
}


function exitApp() {
    connection.end();
  
};


