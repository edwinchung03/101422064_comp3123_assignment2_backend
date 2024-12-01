// Importing all required libraries at the beginning
const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');
const { body } = require('express-validator')

router.get("/employees", async (req, res) => {
  try {
    // will find all employees in the database
    const employees = await Employee.find({});

    return res.status(200).json(
      // function to replace for loop
      employees.map((emp) => ({
        employee_id: emp._id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        position: emp.position,
        salary: emp.salary,
        date_of_joining: emp.date_of_joining,
        department: emp.department,
      }))
    );
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Server error : check your console");
  }
});

router.post("/employees", [
  // validating errors with express-validator
  body("first_name").notEmpty().withMessage("First name is required"),
  body("last_name").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("position").notEmpty().withMessage("Position is required"),
  body("salary").isNumeric().withMessage("Please enter a number"),
  body("date_of_joining").isISO8601().withMessage("Please enter a valid date"),
  body("department").notEmpty().withMessage("Department is required")],
  async (req, res) => {

  // requested bodies to create an employee
  const { first_name, last_name, email, position, salary, date_of_joining, department } = req.body;
    
    try {
      let employee = await Employee.findOne({ email });
      // if employee already exist
      if (employee) {
        return res.status(400).json({ 
          status: false,
          message: "Employee already exists" 
        });
      }
  
      // saving new employee into the database
      employee = new Employee({
        first_name,
        last_name,
        email,
        position,
        salary,
        date_of_joining,
        department
      });
        
      await employee.save();
  
      return res.status(201).json({
          message: "Employee created successfully",
          employee_id: employee._id,
      });

    } catch (err) {
      console.log(err.message);
      return res.status(500).send("Server error : check your console");
    }
  }
);

router.get("/employees/:eid", async (req, res) => {

  try {
    // checking eid parameter
    const employee = await Employee.findById(req.params.eid);

    // if employee doesn't exist
    if (!employee){
      return res.status(404).json({ 
        status: false,
        message: "Employee Not Found" 
      })
    }

    // returning values for that employee
    return res.status(200).json({
      employee_id : employee._id,
      first_name : employee.first_name,
      last_name : employee.last_name,
      email: employee.email,
      position: employee.position,
      salary: employee.salary,
      date_of_joining: employee.date_of_joining,
      department: employee.department
    });

    } catch (err) {
      console.log(err.message);
      return res.status(500).send("Server error : check your console");
    }
});

router.put("/employees/:eid", [
  body("position").notEmpty().withMessage("Position is required"),
  body("salary").isNumeric().withMessage("Please enter a number"),],
  async (req, res) => {
  
    const { first_name, last_name, email, position, salary, date_of_joining, department } = req.body;

  try {

    const employee = await Employee.findById(req.params.eid);
    
    if (!employee){
      return res.status(404).json({ 
        status: false,
        message: "Employee Not Found" 
      });
    }
    if (first_name) employee.first_name = first_name;
    if (last_name) employee.last_name = last_name;
    if (email) employee.email = email;
    if (position) employee.position = position;
    if (salary) employee.salary = salary;
    if (date_of_joining) employee.date_of_joining = date_of_joining;
    if (department) employee.department = department;

    employee.updated_at = Date.now();

    await employee.save();

    return res.status(200).json({
      message: "Employee details updated successfully",
    });

  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Server error : check your console");
  }
});

router.delete("/employees", async (req, res) => {

  // employee id that I want to delete
  const { eid } = req.query;

  try {
    // function to find and delete at the same time
    const employee = await Employee.findByIdAndDelete(eid);

    // if employee doesn't exist
    if (!employee){
      return res.status(404).json({ 
        status: false,
        message: "Employee Not Found" 
      })
    }

    return res.status(204).json({ message: "Employee deleted successfully" });

  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Server error : check your console");
  }
});

router.get("/employees/search", async (req, res) => {
  const { first_name, last_name, email, position, salary, date_of_joining, department } = req.query;

  try {
    const filters = [];

    if (first_name) {
      filters.push({ first_name: { $regex: first_name, $options: "i" } });
    }
    if (last_name) {
      filters.push({ last_name: { $regex: last_name, $options: "i" } });
    }
    if (email) {
      filters.push({ email: { $regex: email, $options: "i" } });
    }
    if (position) {
      filters.push({ position: { $regex: position, $options: "i" } });
    }
    if (department) {
      filters.push({ department: { $regex: department, $options: "i" } });
    }
    if (salary) {
      const salaryNum = parseFloat(salary);
      if (!isNaN(salaryNum)) {
        filters.push({ salary: salaryNum });
      } else {
        return res.status(400).send("Invalid salary value");
      }
    }
    if (date_of_joining) {
      const date = new Date(date_of_joining);
      if (date instanceof Date && !isNaN(date)) {
        filters.push({ date_of_joining: date });
      } else {
        return res.status(400).send("Invalid date format");
      }
    }
    const query = filters.length > 0 ? { $or: filters } : {};

    const employees = await Employee.find(query);

    return res.status(200).json({
      message: `Search results:`,
      employees: employees.map((emp) => ({
        employee_id: emp.employee_id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        position: emp.position,
        salary: emp.salary,
        date_of_joining: emp.date_of_joining,
        department: emp.department,
      })),
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Server error");
  }
});


module.exports = router;