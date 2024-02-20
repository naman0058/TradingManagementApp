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



router.get('/dashboard',verify.adminAuthenticationToken,(req,res)=>{
  res.render(`dashboard`)
})



router.get('/dashboard/add/customer',verify.adminAuthenticationToken,(req,res)=>{
  res.render(`add_customer`,{msg:''})
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
module.exports = router;
