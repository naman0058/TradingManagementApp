
router.get('/readold', (req, res) => {
    const excelFilePath = 'public/read.xlsx';
  
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    //  pool.query(`select * from from users where`)
    if (data[1]["Sharekhan Limited"] === "CUSTOMER ID :- ") {
        let customer_id = data[1].__EMPTY;
        pool.query(`select * from users where unique_id = '${customer_id}'`, (err, result) => {
            if (err) throw err;
            else if (result[0]) {
                let title = data[9]["Sharekhan Limited"];
                // Assuming data is an array of objects
  // Assuming data is an array of objects
  // Assuming data is an array of objects
  for (let i = 11; i < data.length; i++) {
    const currentData = data[i];
  
    // Check if any of the specified keys have empty values
    const hasEmptyValues = ["Serise", "Buy", "Avg Buying Rate", "Sell", "Avg Sell Rate", "Net Position", "Wt.Avg.Price", "BE Price", "P&L Actual"]
      .some((key) => currentData[key] === "");
  
    // If any of the specified keys have empty values, skip this data
    if (!hasEmptyValues) {
      const newData = {};
  
      // Loop through keys of the current data
      Object.keys(currentData).forEach((key) => {
        // Replace "__EMPTY" with corresponding values
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
          // Add more cases for other keys as needed
          default:
            newData[key] = currentData[key];
        }
      });
  
      // Replace the current data with the updated data
      data[i] = newData;
    }
  }
  
  // Filter out the data where keys have empty values
  const filteredData = data.slice(11).filter((item) => Object.values(item).some((value) => value !== ""));
  // res.json(filteredData);  // Sending the updated and filtered data to the response
  
  let resultArrays = [];
  let currentArray = [];
  
  for (let i = 0; i < filteredData.length; i++) {
      if (filteredData[i].Exc && filteredData[i].Exc.includes("Expiry Date")) {
        let date = filteredData[i].Exc;
          // If the current object contains "Expiry Date", push the current array into the resultArrays
          if (currentArray.length > 0) {
              resultArrays.push(currentArray);
              currentArray = [];
          }
      }
      currentArray.push(filteredData[i]);
  }
  
  // Push the last array into resultArrays if it's not empty
  if (currentArray.length > 0) {
      resultArrays.push(currentArray);
  }
  
  // Now resultArrays contains multiple arrays whenever "Expiry Date" is encountered in the Exc field
  res.json(resultArrays);
  
  
  
  // Now data[11] to data[data.length - 1] has updated keys
  // res.json(data.slice(11));  // Sending the updated data to the response
  
                // res.json(data[10]);
            } else {
                res.json({ msg: 'Customer Not Exists in Our Database', customer_id });
            }
        });
  
    } else {
        res.json({ msg: 'format change' });
    }
  });
  
  
  
  
  
  
  
  router.get('/read1', (req, res) => {
  
      const excelFilePath = 'public/read.xlsx';
  
      const workbook = xlsx.readFile(excelFilePath);
  
      const sheetName = workbook.SheetNames[0];
  
      const worksheet = workbook.Sheets[sheetName];
  
      const data = xlsx.utils.sheet_to_json(worksheet);
  
      if (data[1]["Sharekhan Limited"] === "CUSTOMER ID :- ") {
  
          let customer_id = data[1].__EMPTY;
  
          pool.query(`select * from users where unique_id = '${customer_id}'`, (err, result) => {
  
              if (err) throw err;
  
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
  
                  res.json(trimmedResultArrays);
  
              } else {
  
                  res.json({ msg: 'Customer Not Exists in Our Database', customer_id });
  
              }
  
          });
  
      } else {
  
          res.json({ msg: 'format change' });
  
      }
  
  });
  
  
  
  
  router.get('/read2', (req, res) => {
    const excelFilePath = 'public/read.xlsx';
  
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    //  pool.query(`select * from from users where`)
    if (data[1]["Sharekhan Limited"] === "CUSTOMER ID :- ") {
        let customer_id = data[1].__EMPTY;
        pool.query(`select * from users where unique_id = '${customer_id}'`, (err, result) => {
            if (err) throw err;
            else if (result[0]) {
                let title = data[9]["Sharekhan Limited"];
                // Assuming data is an array of objects
  // Assuming data is an array of objects
  // Assuming data is an array of objects
  for (let i = 11; i < data.length; i++) {
    const currentData = data[i];
  
    // Check if any of the specified keys have empty values
    const hasEmptyValues = ["Serise", "Buy", "Avg Buying Rate", "Sell", "Avg Sell Rate", "Net Position", "Wt.Avg.Price", "BE Price", "P&L Actual"]
      .some((key) => currentData[key] === "");
  
    // If any of the specified keys have empty values, skip this data
    if (!hasEmptyValues) {
      const newData = {};
  
      // Loop through keys of the current data
      Object.keys(currentData).forEach((key) => {
        // Replace "__EMPTY" with corresponding values
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
          // Add more cases for other keys as needed
          default:
            newData[key] = currentData[key];
        }
      });
  
      // Replace the current data with the updated data
      data[i] = newData;
    }
  }
  
  // Filter out the data where keys have empty values
  const filteredData = data.slice(11).filter((item) => Object.values(item).some((value) => value !== ""));
  // res.json(filteredData);  // Sending the updated and filtered data to the response
  
  
  // Assuming filteredData contains the filtered and updated data
  let result = [];
  let currentArray = [];
  
  filteredData.forEach(item => {
      if (item && item.Exc && item.Exc.includes('Expiry Date')) {
          // If the item is defined and contains 'Expiry Date', create a new array
          currentArray = [item];
          result.push(currentArray);
      } else if (item && item['P&L Actual'] && item['P&L Actual'].includes('Expiry total')) {
          // If the item is defined and contains 'Expiry total', add it to the current array
          currentArray.push(item);
      }
  });
  
  // At this point, result will be an array of arrays, where each inner array contains data for a specific date
  
  // res.json(result)
  
  let combinedResult = [];
  console.log(result[0][0])
  
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
  
  res.json(combinedResult);
  
  
  // Now data[11] to data[data.length - 1] has updated keys
  // res.json(data.slice(11));  // Sending the updated data to the response
  
                // res.json(data[10]);
            } else {
                res.json({ msg: 'Customer Not Exists in Our Database', customer_id });
            }
        });
  
    } else {
        res.json({ msg: 'format change' });
    }
  });