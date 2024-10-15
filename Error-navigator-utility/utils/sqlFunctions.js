const { connectDB } = require('./database');
const jwt = require('jsonwebtoken');

//Function to create a table (if needed)
const createTable = async (schema) => {
    try {
        const pool = await connectDB();
        const [results] = await pool.query(schema);
        return results;
    } catch (error) {
        console.error('Error creating table:', error);
        throw error;
    }
};

//Function to check if a record exists
const checkRecordExists = async (tableName, column, value) => {
    try {
        const pool = await connectDB();
        const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE ${column} = ?`, [value]);
        return rows.length ? rows[0] : null;
    } catch (error) {
        console.error('Error checking record existence:', error);
        throw error;
    }
};

//Function to insert a record into a table
const insertRecord = async (tableName, record) => {
   try {
        const pool = await connectDB();
        const sql = `INSERT INTO ${tableName} SET ?`;
        const [results] = await pool.execute(sql, record);    
        return results;
    } catch (error) {
        console.error('Error inserting record:', error);
        throw error;
   }
};      

//Function to update a record in the table
const updateRecord = async (tableName, conditionField, conditionValue, updatedData) => { 
    try {
        const pool = await connectDB();

        //Construct the SET part of the query dynamically
        const setClause = Object.keys(updatedData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updatedData), conditionValue];
        
        //Create a SQL query
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${conditionField} = ?`;
        const [results] = await pool.execute(sql, values);
        
        if (results.affectedRows === 0) {
            throw new Error('No record updated for ${conditionField} = ${conditionValue}');
        }
        return results;
    } catch (error) {
        console.error('Error updating record: ${err.message}');
        throw error;
    }
};

//Function to generate a JWT access token
const generateAccessToken = (staffid) => {  
    return jwt.sign({ staffid }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};

module.exports = {
    createTable,
    checkRecordExists,
    insertRecord,
    updateRecord,
    generateAccessToken
};

