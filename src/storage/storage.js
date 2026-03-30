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

const insertVietlottResult35 = async (drawDate, drawNumb, numbers, special) => {
  const query = `INSERT INTO vietlott_results_35 (draw_date, draw_numb, number1, number2, number3, number4, number5, numberextra) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
  try {
    await pool.query(query, [drawDate, drawNumb, numbers[0], numbers[1], numbers[2], numbers[3], numbers[4], special]);
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

const fetchAllVietlottResult35 = async () => {
  try {
    const result = await pool.query('SELECT number1, number2, number3, number4, number5, draw_numb FROM vietlott_results_35');
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

const fetchVietlottResultNumb = async (numb = 0, is55 = false) => {
  const table = is55 ? 'vietlott_results_55' : 'vietlott_results_45';
  try {
    const result = await pool.query(`SELECT number1, number2, number3, number4, number5, number6 FROM ${table} WHERE draw_numb = '${numb}';`);
    const findDraw = result.rows?.length ? Object.values(result.rows[0]) : []; // [{ number1: 1, ..., number6: 45 }, ...]
    return findDraw;
  } catch (err) {
    console.error("Error fetch data:", err);
    return [];
  }
}

const fetchHighestVietlottNumb = async (is55 = false) => {
  const table = is55 ? 'vietlott_results_55' : 'vietlott_results_45';
  try {
    const result = await pool.query(`SELECT draw_numb FROM ${table} ORDER BY draw_numb DESC LIMIT 1;`);
    const findDraw = result.rows?.length ? result.rows[0]?.draw_numb : 9999; // [{ draw_numb: 1}]
    return findDraw;
  } catch (err) {
    console.error("Error fetch data:", err);
    return [];
  }
}

const fetchHighestVietlottNumb35 = async () => {
  const table = 'vietlott_results_35';
  try {
    const result = await pool.query(`SELECT draw_numb FROM ${table} ORDER BY draw_numb DESC LIMIT 1;`);
    const findDraw = result.rows?.length ? result.rows[0]?.draw_numb : 9999; // [{ draw_numb: 1}]
    return findDraw;
  } catch (err) {
    console.error("Error fetch data:", err);
    return [];
  }
}

module.exports = {
  insertVietlottResult45,
  fetchAllVietlottResult45,
  insertVietlottResult55,
  fetchAllVietlottResult55,
  fetchVietlottResultNumb,
  fetchHighestVietlottNumb,
  insertVietlottResult35,
  fetchAllVietlottResult35,
  fetchHighestVietlottNumb35,
};
