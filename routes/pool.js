
var mysql = require('mysql2')

const pool = mysql.createPool({

  host : 'db-mysql-blr1-30615-do-user-16192783-0.c.db.ondigitalocean.com',
   user: 'doadmin',
  password:'AVNS_kkPKnkohsUpl8Sa1iL2',
    database: 'trading_app_management',
    port:'25060' ,
    multipleStatements: true,



  })



  // country , story , blog-category , blogs , state , 



  // var mysql = require('mysql')
  // require('dotenv').config()
  
  // const pool = mysql.createPool({
  //   host:'103.117.180.114',
  //   ///host : 'localhost',
  //    user: 'shopsun_shopsun',
  //   password:'Shopsun@321!',
  //     database: 'shopsun_shopsun',
  //     port:'3306' ,
  //     multipleStatements: true
  //   })
  
  
  
  
  // module.exports = pool;

module.exports = pool;




