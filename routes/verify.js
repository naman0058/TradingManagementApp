var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const secretkey = 'ashdgjgssfdgSFGF'
const fs = require('fs');
const xlsx = require('xlsx');

var pool = require('./pool');






// function userAuthenticationToken(req,res,next){
//     // const token = req.headers['authrorization'];
//     const token = undefined
//     if(!token) return res.status(401).json({message : 'Token not provided'})
//     jwt.verify(token,secretkey,(err,data)=>{
//       if(err) res.status(401).json({message:'Invalid Token Recieved'})
//       req.user = data
//       next();
//     })
//   }


function userAuthenticationToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
  }
  jwt.verify(token, secretkey, (err, data) => {
      if (err) {
          return res.status(401).json({ message: 'Invalid Token Received' });
      }
      req.user = data;
      next();
  });
}



function adminAuthenticationToken(req,res,next){
  if(req.session.adminid) {
    req.categories = true;
     next();
  }
  else {
    res.render('login',{msg:'Wrong Credentials'})
    next()
  }
}


const readDetailedExcelData = async () => {

  const excelFilePath = 'public/read.xlsx';
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  if (data[1]["Sharekhan Limited"] === "CUSTOMER ID :- ") {
      let customer_id = data[1].__EMPTY;
      return new Promise((resolve, reject) => {
          pool.query(`select * from users where unique_id = '${customer_id}'`, (err, result) => {
              if (err) reject(err);
              else if (result[0]) {
                  let title = data[9]["Sharekhan Limited"];
                  for (let i = 11; i < data.length; i++) {
                      const currentData = data[i];
                      const hasEmptyValues = ["Serise", "Buy", "Avg Buying Rate", "Sell", "Avg Sell Rate", "Net Position", "Wt.Avg.Price", "BE Price", "P&L Actual"]
                          .some((key) => currentData[key] === "");
                      if (!hasEmptyValues) {
                          const newData = {};
                          Object.keys(currentData).forEach((key) => {
                              switch (key) {
                                  case "__EMPTY":
                                      newData["serise"] = currentData[key];
                                      break;
                                  case "__EMPTY_1":
                                      newData["buy"] = currentData[key];
                                      break;
                                  case "__EMPTY_2":
                                      newData["avg_buying_price"] = currentData[key];
                                      break;
                                  case "__EMPTY_3":
                                      newData["sell"] = currentData[key];
                                      break;
                                  case "__EMPTY_4":
                                      newData["avg_sell_rate"] = currentData[key];
                                      break;
                                  case "__EMPTY_5":
                                      newData["net_position"] = currentData[key];
                                      break;
                                  case "__EMPTY_6":
                                      newData["wt_avg_price"] = currentData[key];
                                      break;
                                  case "__EMPTY_7":
                                      newData["be_price"] = currentData[key];
                                      break;
                                  case "__EMPTY_8":
                                      newData["actual_pl"] = currentData[key];
                                      break;
                                  case "Sharekhan Limited":
                                      newData["Exc"] = currentData[key];
                                      newData["date"] = currentData[key];
                                      break;
                                  default:
                                      newData[key] = currentData[key];
                              }
                          });
                          data[i] = newData;
                      }
                  }
                  const filteredData = data.slice(11).filter((item) => Object.values(item).some((value) => value !== ""));
                  let resultArrays = [];
                  let currentArray = [];
                  for (let i = 0; i < filteredData.length; i++) {
                      if (filteredData[i].Exc && filteredData[i].Exc.includes("Expiry Date")) {
                          let date = filteredData[i].Exc;
                          if (currentArray.length > 0) {
                              resultArrays.push(currentArray);
                              currentArray = [];
                          }
                      }
                      currentArray.push(filteredData[i]);
                  }
                  if (currentArray.length > 0) {
                      resultArrays.push(currentArray);
                  }
                  const modifiedResultArrays = resultArrays.map(subArray => {
                      const exc = subArray[0].Exc;
                      return subArray.map(obj => ({...obj, unique_id: customer_id, date: exc.split(" : ")[1]}));
                  });
                  // Remove first and last objects of each array
                  const trimmedResultArrays = modifiedResultArrays.map(subArray => {
                      const length = subArray.length;
                      return subArray.slice(1, length - 1);
                  });
                  resolve(trimmedResultArrays);
              } else {
                  reject({ msg: 'Customer Not Exists in Our Database', customer_id });
              }
          });
      });
  } else {
      return { msg: 'format change' };
  }
};





  module.exports = {
    userAuthenticationToken,
    adminAuthenticationToken,
    readDetailedExcelData
  }


//   wkltwfbwnhnvzmwr