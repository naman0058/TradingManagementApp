var express = require('express');
var router = express.Router();
var pool = require('./pool');

const fs = require('fs');
const xlsx = require('xlsx');

router.get('/read', (req, res) => {
const excelFilePath = 'public/read.xlsx';

   const workbook = xlsx.readFile(excelFilePath);
   const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
   const worksheet = workbook.Sheets[sheetName];
   const data = xlsx.utils.sheet_to_json(worksheet);
   res.json(data);
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
