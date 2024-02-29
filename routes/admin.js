var express = require('express');
var router = express.Router();
var pool = require('./pool');
const util = require('util');
const queryAsync = util.promisify(pool.query).bind(pool);
var verify = require('./verify')

/* GET users listing. */


router.get('/login', function(req, res) {
  res.render('login',{msg:''})
});


router.post('/login',(req,res)=>{
  let body = req.body;
  console.log("body",body)
 
pool.query(`select * from admin where email ='${body.email}' and password = '${body.password}'`,(err,result)=>{
  
   if(err) throw err;
   else if(result[0]) {
    console.log('id',result[0].id)
       req.session.adminid = result[0].id
       res.redirect('/admin/dashboard')
      }
   else res.render(`login`,{msg : 'Enter Wrong Creaditionals'})
})
 
})



// router.get('/dashboard',verify.adminAuthenticationToken,(req,res)=>{
//   res.render(`dashboard`)

// })


router.get('/dashboard', verify.adminAuthenticationToken, (req, res) => {
  var getCurrentWeekDates = verify.getCurrentWeekDates();
  var getCurrentMonthDates = verify.getCurrentMonthDates();
  var getLastMonthDates = verify.getLastMonthDates();
  var getCurrentYearDates = verify.getCurrentYearDates();
  var weeklyreport = `select COALESCE(sum(actual_pl), 0) as weekly_actual_pl from short_report where str_to_date(date, '%d-%m-%Y') between '${getCurrentWeekDates.startDate}' and '${getCurrentWeekDates.endDate}';`;
  var monthlyreport = `select COALESCE(sum(actual_pl), 0) as monthly_actual_pl from short_report where str_to_date(date, '%d-%m-%Y') between '${getCurrentMonthDates.startDate}' and '${getCurrentMonthDates.endDate}';`;
  var lastmonthreport = `select COALESCE(sum(actual_pl), 0) as last_month_actual_pl from short_report where str_to_date(date, '%d-%m-%Y') between '${getLastMonthDates.startDate}' and '${getLastMonthDates.endDate}';`;
  var yearlyreport = `select COALESCE(sum(actual_pl), 0) as yearly_actual_pl from short_report where str_to_date(date, '%d-%m-%Y') between '${getCurrentYearDates.startDate}' and '${getCurrentYearDates.endDate}';`;
  var lasttrade = `select * from short_report where unique_id = '${req.query.unique_id}' order by str_to_date(date, '%d-%m-%Y') desc limit 30;`
  pool.query(weeklyreport + monthlyreport + lastmonthreport + yearlyreport+lasttrade, (err, result) => {
      if (err) throw err;
      else res.render(`dashboard`,{result,unique_id:req.query.unique_id})
      // else res.json(result);
  });
});



router.get('/dashboard/add/customer',verify.adminAuthenticationToken,(req,res)=>{
  res.render(`add_customer`,{msg:''})
})

router.get('/dashboard/report',verify.adminAuthenticationToken,(req,res)=>{
  res.render(`report`,{msg:''})
})


router.post('/dashboard/customer/add', async (req, res) => {


  try {
      const { unique_id } = req.body;

      // Check if seo_name already exists
      const existingRecord = await queryAsync('SELECT id FROM users WHERE unique_id = ?', [unique_id]);

      if (existingRecord.length > 0) {
          return res.json({ msg: 'exists' });
      }

      // Insert new record
      const insertResult = await queryAsync('INSERT INTO users SET ?', req.body);

      if (insertResult.affectedRows > 0) {
          res.json({ msg: 'success' });
      } else {
          res.json({ msg: 'error' });
      }
  } catch (error) {
      console.error('Error in customer/add:', error);
      res.status(500).json({ msg: 'error' });
  }
});


router.get('/dashboard/customer/list', async (req, res) => {
  try {
    let query = `SELECT * FROM users`;
    const result = await queryAsync(query);
    res.render(`list`, { result });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal Server Error');
  }
 });



 router.get('/dashboard/update/data',(req,res)=>{
  let id = req.query.id;
  pool.query(`select * from users where id = ${id}`,(err,result)=>{
    if(err) throw err;
    else res.render(`updatedata`,{result})
  })
  
})



router.post('/dashboard/upload/data', (req, res) => {
  console.log('req.body', req.body);
  pool.query('UPDATE users SET ? WHERE id = ?', [req.body, req.body.id], (err, result) => {
      if (err) {
          console.error('Error updating data:', err);
          return res.status(500).json({ msg: 'error' });
      }
      res.json({ msg: 'success' });
  });
});


router.get('/dashboard/delete/data',(req,res)=>{
  let id = req.query.id;
  pool.query(`delete from users where id = ${id}`,(err,result)=>{
    if(err) throw err;
    else res.redirect('/admin/dashboard/customer/list')
  })
  
})



router.get('/dashboard/customer/account/link',verify.adminAuthenticationToken,(req,res)=>{
  res.render(`link`,{msg:''})
})


router.get('/dashboard/users/show', async (req, res) => {
  try {
    let query = `SELECT * FROM users`;
    const result = await queryAsync(query);
    res.json(result);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal Server Error');
  }
 });



 router.post('/dashboard/account/link', async (req, res) => {


  try {
      const { main_account_holder , second_account_holder } = req.body;

      // Check if seo_name already exists
      const existingRecord = await queryAsync('SELECT id FROM linked_account WHERE main_account_holder = ? and second_account_holder = ?', [main_account_holder , second_account_holder]);

      if (existingRecord.length > 0) {
          return res.json({ msg: 'exists' });
      }

      // Insert new record
      const insertResult = await queryAsync('INSERT INTO linked_account SET ?', req.body);

      if (insertResult.affectedRows > 0) {
          res.json({ msg: 'success' });
      } else {
          res.json({ msg: 'error' });
      }
  } catch (error) {
      console.error('Error in Linked Account/add:', error);
      res.status(500).json({ msg: 'error' });
  }
});



router.get('/dashboard/linked/account', async (req, res) => {
  console.log(req.query)
  try {
    let query = `SELECT * FROM linked_account WHERE main_account_holder = '${req.query.unique_id}' OR second_account_holder = '${req.query.unique_id}'`;
    const result = await queryAsync(query);
    console.log(result)
    res.render(`account-link-list`, { result , urlid : req.query.unique_id });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Internal Server Error');
  }
 });




 router.get('/dashboard/link/account/delete/data',(req,res)=>{
  let id = req.query.id;
  pool.query(`delete from linked_account where id = ${id}`,(err,result)=>{
    if(err) throw err;
    else res.redirect(`/admin/dashboard/linked/account?unique_id=${req.query.urlid}`)
  })
  
})


router.get('/dashboard/add/csv',verify.adminAuthenticationToken,(req,res)=>{
  res.render(`add_csv`,{msg:''})
})



router.get('/customer/dashboard', verify.adminAuthenticationToken, (req, res) => {
  var getCurrentWeekDates = verify.getCurrentWeekDates();
  var getCurrentMonthDates = verify.getCurrentMonthDates();
  var getLastMonthDates = verify.getLastMonthDates();
  var getCurrentYearDates = verify.getCurrentYearDates();
  var weeklyreport = `select COALESCE(sum(actual_pl), 0) as weekly_actual_pl from short_report where unique_id = '${req.query.unique_id}' and str_to_date(date, '%d-%m-%Y') between '${getCurrentWeekDates.startDate}' and '${getCurrentWeekDates.endDate}';`;
  var monthlyreport = `select COALESCE(sum(actual_pl), 0) as monthly_actual_pl from short_report where unique_id = '${req.query.unique_id}' and str_to_date(date, '%d-%m-%Y') between '${getCurrentMonthDates.startDate}' and '${getCurrentMonthDates.endDate}';`;
  var lastmonthreport = `select COALESCE(sum(actual_pl), 0) as last_month_actual_pl from short_report where unique_id = '${req.query.unique_id}' and str_to_date(date, '%d-%m-%Y') between '${getLastMonthDates.startDate}' and '${getLastMonthDates.endDate}';`;
  var yearlyreport = `select COALESCE(sum(actual_pl), 0) as yearly_actual_pl from short_report where unique_id = '${req.query.unique_id}' and str_to_date(date, '%d-%m-%Y') between '${getCurrentYearDates.startDate}' and '${getCurrentYearDates.endDate}';`;
  var lasttrade = `select * from short_report where unique_id = '${req.query.unique_id}' order by str_to_date(date, '%d-%m-%Y') desc limit 30;`
  pool.query(weeklyreport + monthlyreport + lastmonthreport + yearlyreport+lasttrade, (err, result) => {
      if (err) throw err;
      else res.render(`customerdashboard`,{result,unique_id:req.query.unique_id})
      // else res.json(result);
  });
});



router.get('/bar-graph', (req, res) => {
  var query = `SELECT
      IFNULL(SUM(CAST(actual_pl AS DECIMAL)), 0) AS total_actual_pl
  FROM
      (
          SELECT '01' AS month UNION ALL SELECT '02' UNION ALL SELECT '03' UNION ALL
          SELECT '04' UNION ALL SELECT '05' UNION ALL SELECT '06' UNION ALL
          SELECT '07' UNION ALL SELECT '08' UNION ALL SELECT '09' UNION ALL
          SELECT '10' UNION ALL SELECT '11' UNION ALL SELECT '12'
      ) AS months
  LEFT JOIN
      short_report AS sr ON SUBSTRING(sr.date, 4, 2) = months.month AND YEAR(STR_TO_DATE(sr.date, '%d-%m-%Y')) = YEAR(CURDATE()) and unique_id = '${req.query.unique_id}'
  GROUP BY
      months.month
  ORDER BY
      months.month;`;
  pool.query(query, (err, result) => {
      if (err) {
          throw err;
      } else {
          const totalActualPl = result.map(item => item.total_actual_pl);
          res.json(totalActualPl);
      }
  });
});



router.get('/commission-graph', (req, res) => {
  var query = `SELECT
      IFNULL(SUM(CAST(actual_pl AS DECIMAL)), 0) AS total_actual_pl
  FROM
      (
          SELECT '01' AS month UNION ALL SELECT '02' UNION ALL SELECT '03' UNION ALL
          SELECT '04' UNION ALL SELECT '05' UNION ALL SELECT '06' UNION ALL
          SELECT '07' UNION ALL SELECT '08' UNION ALL SELECT '09' UNION ALL
          SELECT '10' UNION ALL SELECT '11' UNION ALL SELECT '12'
      ) AS months
  LEFT JOIN
      short_report AS sr ON SUBSTRING(sr.date, 4, 2) = months.month AND YEAR(STR_TO_DATE(sr.date, '%d-%m-%Y')) = YEAR(CURDATE()) and unique_id = '${req.query.unique_id}'
  GROUP BY
      months.month
  ORDER BY
      months.month;`;
  pool.query(query, (err, result) => {
      if (err) {
          throw err;
      } else {
          const dataWithCommission = result.map(item => {
              const totalActualPl = parseFloat(item.total_actual_pl);
              const commission = totalActualPl * 0.2;
              return { total_actual_pl: totalActualPl, commission: commission };
          });

          const totalActualPl = dataWithCommission.map(item => item.commission);
          res.json(totalActualPl);
          // res.json(dataWithCommission);
      }
  });
});



router.get('/dashboard/bar-graph', (req, res) => {
  var query = `SELECT
      IFNULL(SUM(CAST(actual_pl AS DECIMAL)), 0) AS total_actual_pl
  FROM
      (
          SELECT '01' AS month UNION ALL SELECT '02' UNION ALL SELECT '03' UNION ALL
          SELECT '04' UNION ALL SELECT '05' UNION ALL SELECT '06' UNION ALL
          SELECT '07' UNION ALL SELECT '08' UNION ALL SELECT '09' UNION ALL
          SELECT '10' UNION ALL SELECT '11' UNION ALL SELECT '12'
      ) AS months
  LEFT JOIN
      short_report AS sr ON SUBSTRING(sr.date, 4, 2) = months.month AND YEAR(STR_TO_DATE(sr.date, '%d-%m-%Y')) = YEAR(CURDATE())
  GROUP BY
      months.month
  ORDER BY
      months.month;`;
  pool.query(query, (err, result) => {
      if (err) {
          throw err;
      } else {
          const totalActualPl = result.map(item => item.total_actual_pl);
          res.json(totalActualPl);
      }
  });
});


router.get('/dashboard/commission-graph', (req, res) => {
  var query = `SELECT
      IFNULL(SUM(CAST(actual_pl AS DECIMAL)), 0) AS total_actual_pl
  FROM
      (
          SELECT '01' AS month UNION ALL SELECT '02' UNION ALL SELECT '03' UNION ALL
          SELECT '04' UNION ALL SELECT '05' UNION ALL SELECT '06' UNION ALL
          SELECT '07' UNION ALL SELECT '08' UNION ALL SELECT '09' UNION ALL
          SELECT '10' UNION ALL SELECT '11' UNION ALL SELECT '12'
      ) AS months
  LEFT JOIN
      short_report AS sr ON SUBSTRING(sr.date, 4, 2) = months.month AND YEAR(STR_TO_DATE(sr.date, '%d-%m-%Y')) = YEAR(CURDATE())
  GROUP BY
      months.month
  ORDER BY
      months.month;`;
  pool.query(query, (err, result) => {
      if (err) {
          throw err;
      } else {
          const dataWithCommission = result.map(item => {
              const totalActualPl = parseFloat(item.total_actual_pl);
              const commission = totalActualPl * 0.2;
              return { total_actual_pl: totalActualPl, commission: commission };
          });

          const totalActualPl = dataWithCommission.map(item => item.commission);
          res.json(totalActualPl);
          // res.json(dataWithCommission);
      }
  });
});


router.get('/customer/trade/details',(req,res)=>{
  var query = `select * from detail_report where date = '${req.query.date}' and unique_id = '${req.query.unique_id}';`
  pool.query(query,(err,result)=>{
    if(err) throw err;
    else res.render('trade_list',{result})
  })
})




router.post('/report/search',(req,res)=>{
  console.log(req.body)
  var query =`select * from short_report where str_to_date(date, '%d-%m-%Y') between '${req.body.from_date}' and '${req.body.to_date}' and unique_id  = '${req.body.unique_id}' order by date`
  pool.query(query,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})

module.exports = router;
