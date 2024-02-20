var express = require('express');
var router = express.Router();
var verify = require('./verify')
var jwt = require('jsonwebtoken');
const secretkey = 'ashdgjgssfdgSFGF'
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/register',(req,res)=>{
  let query = req.query;
  res.json({msg:'Successfully Registered',Data:query})
})


router.get('/login',(req,res)=>{
  const token = jwt.sign(req.query,secretkey,{expiresIn:3000})
  res.json(token)
})




//  router.get('/home',verify.userAuthenticationToken,(req,res)=>{
//   pool.query(`select * from user where id = ${req.user}`,(err,result)=>{
//     if(err) throw err;
//     else if(result[0]){
//       res.json({msg:'user not found'})
//     }
//     else{
//       res.json({msg:'accessible',user:req.user})

//     }
//   })
//  })



router.get('/home', verify.userAuthenticationToken, async (req, res) => {
  try {
      const result = await pool.query(`SELECT * FROM user WHERE id = ${req.user}`);
      if (result.length === 0) {
          res.json({ msg: 'user not found' });
      } else {
          res.json({ msg: 'accessible', user: req.user });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Internal Server Error' });
  }
});


module.exports = router;
