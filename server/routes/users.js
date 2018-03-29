var express = require('express');
var router = express.Router();
var user = require('./../models/user')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function (req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  user.findOne(param, (err, doc) => {
    if (err) {
      res.json({status: '1', msg: err.message});
    } else {
      if (doc) {
        res.cookie('userId', doc.userId, {
          path: '/',
          maxAge: 1000 *60 * 60
        });
        res.cookie('userName', doc.userName, {
          path: '/',
          maxAge: 1000 *60* 60
        });
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  })
});

// 退出登录
router.post('/logout', (req, res, next) => {
  res.cookie('userId', "", {
    path: '/',
    maxAge: -1
  })
  res.json({status: 0, msg: '', result: ''})
})

// 检查登录

router.get('/checkLogin', (req, res, next) => {
  if (req.cookies.userId) {
    res.json({status: '0', msg: '', result: req.cookies.userName})
  } else {
    res.json({status: '1', msg: '未登录', result: ''})
  }
})

// 购物车
router.get('/cartList', (req, res, next) => {
  let userId = req.cookies.userId
  user.findOne({
    userId: userId
  }, (err, doc) => {
    if (err) {
      res.json({status: '1', msg: err.message, result: ''})
    } else {
      if (doc) {
        res.json({status: '0', msg: '', result: doc.cartList})
      }
    }
  })
})
// 删除商品
router.post('/delCartProduct', (req, res, next) => {
  let productId = req.body.productId;
  let userId = req.cookies.userId;

  user.update({
    userId: userId
  }, {
    $pull: {
      'cartList': {
        'productId': productId
      }
    }
  }, (err, doc) => {
    if (err) {
      res.json({status: '1', msg: err.message, result: ''})
    } else {
      console.log(doc)
      res.json({status: '0', msg: '', result: 'success'})
    }
  })
})

// 商品数量

router.post('/cartProductNum', (req, res, next) => {
  let userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;

  user.update({
    userId: userId,
    'cartList.productId': productId
  }, {
    'cartList.$.productNum': productNum,
    'cartList.$.checked': checked
  }, (err, doc) => {
    if (err) {
      res.json({status: '1', msg: err.message, result: ''})
    } else {
      console.log(doc)
      res.json({status: '0', msg: '', result: 'success'})
    }
  })
})

// 全选

router.post('/editCheckAll',(req,res,next)=>{
  let userId = req.cookies.userId,
      checkAll = req.body.checkAll ? '1' : '0';

    user.findOne({userId:userId},(err,doc)=>{
      if (err) {
        res.json({status: '1', msg: err.message, result: ''})
      } else {
        if(doc){
          doc.cartList.forEach(item => {
            item.checked = checkAll
          });
          doc.save((err1,doc1)=>{
            if (err1) {
              res.json({status: '1', msg: err1.message, result: ''})
            } else {
              console.log(doc)
              res.json({status: '0', msg: '', result: 'success'})
            }
          })
        }
      }
    })
})

module.exports = router;
