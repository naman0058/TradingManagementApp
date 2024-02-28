var express = require('express');
var router = express.Router();
var pool = require('./pool');
var verify = require('./verify')
const fs = require('fs');
const xlsx = require('xlsx');


router.get('/short-report',(req,res)=>{
  pool.query(`select * from short_report order by id desc`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})

router.get('/read1', async (req, res) => {
  try {
      const result = await verify.readDetailedExcelData();
      res.json(result);
  } catch (error) {
      res.json(error);
  }
});


router.get('/detaildata', async (req, res) => {
  try {
      const result = await verify.readDetailedExcelData(); // Assuming verify module has the function readDetailedExcelData
      // Function to insert data into detail_report table and check for duplicates
      const insertDataIntoDetailReport = async (rowData) => {
          for (const row of rowData) {
              // Check if data already exists in the detail_report table
              const selectQuery = `SELECT * FROM detail_report WHERE col1 = '${row.col1}' AND col2 = '${row.col2}' AND col3 = '${row.col3}'`; // Replace col1, col2, col3 with your column names
              const existingData = await pool.query(selectQuery);
              if (existingData.length === 0) {
                  // Insert data into detail_report table if it doesn't already exist
                  const insertQuery = 'INSERT INTO detail_report (col1, col2, col3, ...) VALUES (?, ?, ?, ...)'; // Replace col1, col2, col3, ... with your column names
                  const values = [row.col1, row.col2, row.col3]; // Replace col1, col2, col3, ... with your column values
                  await pool.query(insertQuery, values);
              }
          }
      };
      // Call the function to insert data into detail_report table and check for duplicates
      await insertDataIntoDetailReport(result);
      res.json({ msg: 'Data inserted successfully into detail_report table' });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
})



router.get('/read2', (req, res) => {
  const excelFilePath = 'public/read.xlsx';
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  if (data[1]["Sharekhan Limited"] === "CUSTOMER ID :- ") {
      let customer_id = data[1].__EMPTY;
      pool.query(`SELECT * FROM users WHERE unique_id = '${customer_id}'`, (err, result) => {
          if (err) throw err;
          else if (result[0]) {
              let title = data[9]["Sharekhan Limited"];
              const filteredData = [];
              for (let i = 11; i < data.length; i++) {
                  const currentData = data[i];
                  const hasEmptyValues = ["Serise", "Buy", "Avg Buying Rate", "Sell", "Avg Sell Rate", "Net Position", "Wt.Avg.Price", "BE Price", "P&L Actual"]
                      .some((key) => currentData[key] === "");
                  if (!hasEmptyValues) {
                      const newData = {};
                      Object.keys(currentData).forEach((key) => {
                          switch (key) {
                              case "__EMPTY":
                                  newData["Serise"] = currentData[key];
                                  break;
                              case "__EMPTY_1":
                                  newData["Buy"] = currentData[key];
                                  break;
                              case "__EMPTY_2":
                                  newData["Avg Buying Rate"] = currentData[key];
                                  break;
                              case "__EMPTY_3":
                                  newData["Sell"] = currentData[key];
                                  break;
                              case "__EMPTY_4":
                                  newData["Avg Sell Rate"] = currentData[key];
                                  break;
                              case "__EMPTY_5":
                                  newData["Net Position"] = currentData[key];
                                  break;
                              case "__EMPTY_6":
                                  newData["Wt.Avg.Price"] = currentData[key];
                                  break;
                              case "__EMPTY_7":
                                  newData["BE Price"] = currentData[key];
                                  break;
                              case "__EMPTY_8":
                                  newData["P&L Actual"] = currentData[key];
                                  break;
                              case "Sharekhan Limited":
                                  newData["Exc"] = currentData[key];
                                  break;
                              default:
                                  newData[key] = currentData[key];
                          }
                      });
                      filteredData.push(newData);
                  }
              }
              const result = [];
              let currentArray = [];
              for (let i = 0; i < filteredData.length; i++) {
                  if (filteredData[i].Exc && filteredData[i].Exc.includes('Expiry Date')) {
                      currentArray = [filteredData[i]];
                      result.push(currentArray);
                  } else if (filteredData[i]['P&L Actual'] && filteredData[i]['P&L Actual'].includes('Expiry total')) {
                      currentArray.push(filteredData[i]);
                  }
              }
              let combinedResult = [];
              for (let i = 0; i < result.length; i++) {
                  if (result[i][0] && result[i][1]) {
                      let combinedItem = {
                          'unique_id': customer_id,
                          'title': title,
                          'date': result[i][0].Exc.split(" : ")[1],
                          'actual_pl': result[i][1]['P&L Actual'].split(" : ")[1]
                      };
                      combinedResult.push(combinedItem);
                  }
              }
              // Check each combinedResult item for uniqueness before insertion
              let insertionCount = 0;
              combinedResult.forEach(item => {
                  const selectQuery = `SELECT * FROM short_report WHERE unique_id = '${item.unique_id}' AND date = '${item.date}'`;
                  pool.query(selectQuery, (err, existingData) => {
                      if (err) {
                          console.error('Error checking existing data:', err);
                          res.json({ msg: 'Error checking existing data in short_report table' });
                      } else {
                          if (existingData.length === 0) {
                              const insertQuery = 'INSERT INTO short_report (unique_id, title, date, actual_pl) VALUES (?, ?, ?, ?)';
                              const values = [item.unique_id, item.title, item.date, item.actual_pl];
                              pool.query(insertQuery, values, (err, result) => {
                                  if (err) {
                                      console.error('Error inserting data:', err);
                                      res.json({ msg: 'Error inserting data into short_report table' });
                                  } else {
                                      console.log('Data inserted successfully:', result);
                                      insertionCount++;
                                      if (insertionCount === combinedResult.length) {
                                          res.json({ msg: 'All data inserted successfully into short_report table' });
                                      }
                                  }
                              });
                          } else {
                              console.log('Data already exists in short_report table:', existingData);
                              insertionCount++;
                              if (insertionCount === combinedResult.length) {
                                  res.json({ msg: 'All data inserted successfully into short_report table' });
                              }
                          }
                      }
                  });
              });
          } else {
              res.json({ msg: 'Customer Not Exists in Our Database', customer_id });
          }
      });
  } else {
      res.json({ msg: 'format change' });
  }
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
