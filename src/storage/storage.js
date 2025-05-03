const { Pool } = require("pg");
const config = require("../config/config");

const pool = new Pool(config.db);

const insertVietlottResult45 = async (drawDate, drawNumb, numbers) => {
  const query = `INSERT INTO vietlott_results_45 (draw_date, draw_numb, number1, number2, number3, number4, number5, number6) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
  try {
    await pool.query(query, [drawDate, drawNumb, numbers[0], numbers[1], numbers[2], numbers[3], numbers[4], numbers[5]]);
    console.log("Data inserted successfully.");
  } catch (err) {
    console.error("Error inserting data:", err);
  }
};

const insertVietlottResult55 = async (drawDate, drawNumb, numbers, special) => {
  const query = `INSERT INTO vietlott_results_55 (draw_date, draw_numb, number1, number2, number3, number4, number5, number6, numberextra) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
  try {
    await pool.query(query, [drawDate, drawNumb, numbers[0], numbers[1], numbers[2], numbers[3], numbers[4], numbers[5], special]);
    console.log("Data inserted successfully.");
  } catch (err) {
    console.error("Error inserting data:", err);
  }
};

const fetchAllVietlottResult45 = async () => {
  try {
    const result = await pool.query('SELECT number1, number2, number3, number4, number5, number6, draw_numb FROM vietlott_results_45');
    const allDraws = result.rows.sort((a, b) => a.draw_numb - b.draw_numb).map(item => {
      delete item.draw_numb
      return item
    }); // [{ number1: 1, ..., number6: 45 }, ...]
    return allDraws.map(row => Object.values(row))
  } catch (err) {
    console.error("Error inserting data:", err);
    return []
  }
}

const fetchAllVietlottResult55 = async () => {
  try {
    const result = await pool.query('SELECT number1, number2, number3, number4, number5, number6, draw_numb FROM vietlott_results_55');
    const allDraws = result.rows.sort((a, b) => a.draw_numb - b.draw_numb).map(item => {
      delete item.draw_numb
      return item
    }); // [{ number1: 1, ..., number6: 45 }, ...]
    return allDraws.map(row => Object.values(row))
  } catch (err) {
    console.error("Error inserting data:", err);
    return []
  }
}

module.exports = { insertVietlottResult45, fetchAllVietlottResult45, insertVietlottResult55, fetchAllVietlottResult55 };
