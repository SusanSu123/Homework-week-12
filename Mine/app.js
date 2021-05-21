const mysql = require('mysql');
const inquirer = require('inquirer');


const connection = mysql.createConnection({
    host: 'localhost',
    port: 8080,
    user: 'root',
    password:'rootroot',
    database: 'employees_db'
})

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
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
     }).then(function (answer) {
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
        console.table('All Employees:', res);
        options();
    })
};

function viewDepartments() {
    var query = 'SELECT * FROM department';
    connection.query(query, function(err,res) {
        if (err) throw err;
        console.table('All Departments:', res);
        options();
    })
};

function viewRoles() {
    var query = 'SELECT * FROM role';
    connection.query(query, function(err,res) {
        if (err) throw err;
        console.table('All Roles:', res);
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
                name: 'role', 
                type: 'list',
                choices: function() {
                    var roleArray = [];
                    for (let i = 0; i < res.length; i++) {
                        roleArray.push(res[i].title);
                    }         
                    return roleArray;
                }, 
                message: "What is this employee's role? "
            }
          ]).then (function (answer) {
              
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
            }
       ]).then(function (answer) {
           connection.query(
            'INSERT INTO department SET ?',
            {
                name: answer.newDepartment
            });
          var query = 'SELECT * FROM department';
          connection.query(query, function(err, res) {
              if (err) throw err;
              console.log('Your department has been added!');
              console.table('All Departments:', res);
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
                name: 'Department',
                type: 'list',
                choices: function() {
                    var deptArry = [];
                    for (let i = 0; i < res.length; i++) {
                    deptArry.push(res[i].name);
                    }
                    return deptArry;
                },
            }
        ]).then (function (answer) {
            let department_id;
            for (let a = 0; a < res.length; a++) {
                if (res[a].name == answer.Department) {
                    department_id = res[a].id;
                }
            }

            connection.query('INSERT INTO role SET ?', 
            {
                title: answer.new_role,
                salary: answer.salary,
                department_id: department_id
            },
            function (err, res) {
                if(err)throw err;
                console.log('Your new role has been added!');
                console.table('All Roles:', res);
                options();
            })
        })
    })

};

function updateRole() {

};

function deleteEmployee() {

};

function exitApp() {
    connection.end();
  
};


function updateRole() {
    connection.query('SELECT * FROM employee', function(err, result) {
        if (err) throw (err);
    inquirer
        .prompt([
          {
            name: "employeeName",
            type: "list",
// is there a way to make the options here the results of a query that selects all departments?`
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
// in order to get the id here, i need a way to grab it from the departments table 
        .then(function(answer) {
        console.log(answer);
        const name = answer.employeeName;
        /*const role = answer.roleName;
        connection.query('SELECT * FROM role', function(err, res) {
            if (err) throw (err);
            let filteredRole = res.filter(function(res) {
                return res.title == role;
            })
        let roleId = filteredRole[0].id;*/
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
                                
                            })
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
            
            //})
       })
})

}

