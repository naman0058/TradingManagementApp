var express = require("express");
var router = express.Router();
var pool = require("./pool");
var verify = require("./verify");
const fs = require("fs");
const xlsx = require("xlsx");
var upload = require('./multer');

const util = require('util');
const queryAsync = util.promisify(pool.query).bind(pool);


router.post('/user/login', async (req, res) => {
    const { number, password } = req.body;

    try {
        // Use parameterized queries to prevent SQL injection
        const query = 'SELECT id FROM users WHERE number = ? AND password = ?';
        const result = await queryAsync(query, [number, password]);

        if (result.length > 0) {
            res.json(result);
        } else {
            res.json({ msg: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error while logging in:', err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});




router.get('/user/dashboard', verify.userAuthenticationToken, async (req, res) => {
    try {
        const getCurrentWeekDates = verify.getCurrentWeekDates();
        const getCurrentMonthDates = verify.getCurrentMonthDates();
        const getLastMonthDates = verify.getLastMonthDates();
        const getCurrentYearDates = verify.getCurrentYearDates();
        const getLastFinancialYearDates = verify.getLastFinancialYearDates()

        const weeklyreport = `SELECT COALESCE(SUM(actual_pl), 0) AS weekly_actual_pl FROM short_report WHERE unique_id = ? AND str_to_date(date, '%d-%m-%Y') BETWEEN ? AND ?;`;
        const monthlyreport = `SELECT COALESCE(SUM(actual_pl), 0) AS monthly_actual_pl FROM short_report WHERE unique_id = ? AND str_to_date(date, '%d-%m-%Y') BETWEEN ? AND ?;`;
        const lastmonthreport = `SELECT COALESCE(SUM(actual_pl), 0) AS last_month_actual_pl FROM short_report WHERE unique_id = ? AND str_to_date(date, '%d-%m-%Y') BETWEEN ? AND ?;`;
        const yearlyreport = `SELECT COALESCE(SUM(actual_pl), 0) AS yearly_actual_pl FROM short_report WHERE unique_id = ? AND str_to_date(date, '%d-%m-%Y') BETWEEN ? AND ?;`;
        const lastyearlyreport = `SELECT COALESCE(SUM(actual_pl), 0) AS last_yearly_actual_pl FROM short_report WHERE unique_id = ? AND str_to_date(date, '%d-%m-%Y') BETWEEN ? AND ?;`;
        const lasttrade = `SELECT * FROM short_report WHERE unique_id = ? ORDER BY str_to_date(date, '%d-%m-%Y') DESC LIMIT 5;`;

        const queryParams = [
            req.data,
            getCurrentWeekDates.startDate, getCurrentWeekDates.endDate,
            req.data,
            getCurrentMonthDates.startDate, getCurrentMonthDates.endDate,
            req.data,
            getLastMonthDates.startDate, getLastMonthDates.endDate,
            req.data,
            getCurrentYearDates.startDate, getCurrentYearDates.endDate,
            req.data,
            getLastFinancialYearDates.startDate, getLastFinancialYearDates.endDate,
            req.data
        ];

        const sqlQuery = weeklyreport + monthlyreport + lastmonthreport + yearlyreport + lastyearlyreport + lasttrade;
        const result = await queryAsync(sqlQuery, queryParams);


        
        res.json(result);
    } catch (error) {
        console.error('Error while fetching user dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/user/latests-trade', verify.userAuthenticationToken, async (req, res) => {
    var getCurrentYearDates = verify.getCurrentYearDates();

    try {
        const query = `
            SELECT *, 
                (SELECT SUM(actual_pl) FROM short_report WHERE unique_id = ? AND str_to_date(date, '%d-%m-%Y') BETWEEN '${getCurrentYearDates.startDate}' AND '${getCurrentYearDates.endDate}') AS total_sum 
            FROM short_report 
            WHERE unique_id = ? AND str_to_date(date, '%d-%m-%Y') BETWEEN '${getCurrentYearDates.startDate}' AND '${getCurrentYearDates.endDate}' 
            ORDER BY str_to_date(date, '%d-%m-%Y') DESC`;
        
        const result = await queryAsync(query, [req.data, req.data]);

        res.json(result);
    } catch (error) {
        console.error('Error while fetching user latest trades:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





router.get('/user/trade/details', verify.userAuthenticationToken, async (req, res) => {
    try {
        const query = 'SELECT * FROM detail_report WHERE date = ? AND unique_id = ?';
        const result = await queryAsync(query, [req.query.date, req.data]);

        res.json(result);
    } catch (error) {
        console.error('Error while fetching user trade details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  
  
  
  
router.post('/user/report/search', verify.userAuthenticationToken, async (req, res) => {
    try {
        const query = `SELECT * FROM short_report WHERE str_to_date(date, '%d-%m-%Y') BETWEEN ? AND ? AND unique_id = ? ORDER BY date`;
        const queryParams = [req.body.from_date, req.body.to_date, req.data];
        
        const result = await queryAsync(query, queryParams);
        
        res.json(result);
    } catch (error) {
        console.error('Error while searching user report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



    router.get('/user/last/trade',verify.userAuthenticationToken,(req,res)=>{
        
    pool.query(`select date,actual_pl from short_report where unique_id = '${req.data}' order by str_to_date(date, '%d-%m-%Y') desc limit 1`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            let last_date = result[0].date;
            let last_pl = result[0].actual_pl;
            pool.query(`select * from detail_report where date = '${last_date}'`,(err,result)=>{
                if(err) throw err;
                else {
                    res.json({result:result,last_date:last_date,last_pl:last_pl})
                }
            })
        }
        else {
        res.json(result)
        }
    })
    })




    router.get('/user/linked/account',verify.userAuthenticationToken, async (req, res) => {
        console.log(req.query)
        try {
          let query = `SELECT l.* ,(select u.name from users u where u.id = l.second_account_holder) as linked_account FROM linked_account l WHERE main_account_holder = '${req.data}'`;
          const result = await queryAsync(query);
          res.json(result)
        } catch (error) {
          console.error('Error executing query:', error);
          res.status(500).send('Internal Server Error');
        }
       });


       router.get('/user/profile',verify.userAuthenticationToken, async (req, res) => {
        console.log(req.query)
        try {
          let query = `SELECT * FROM users WHERE unique_id = '${req.data}'`;
          const result = await queryAsync(query);
          res.json(result)
        } catch (error) {
          console.error('Error executing query:', error);
          res.status(500).send('Internal Server Error');
        }
       });


       router.post('/contactus', async (req, res) => {


        try {
            const { unique_id } = req.body;
      
      
            // Insert new record
            const insertResult = await queryAsync('INSERT INTO contact SET ?', req.body);
      
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

module.exports = router