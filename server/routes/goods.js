var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var goods = require("../models/goods");
var user = require('../models/user')

// 连接MongoDB数据库
mongoose.connect("mongodb://127.0.0.1:27017/simplemall");
mongoose
  .connection
  .on("connected", () => {
    console.log("MongoDB conntected success");
  });

mongoose
  .connection
  .on("error", () => {
    console.log("MongoDB connected fail");
  });

mongoose
  .connection
  .on("disconnected", () => {
    console.log("MongoDB connected disconnected");
  });
// 查询商品列表
router.get("/list", (req, res, next) => {
  let page = Number(req.param("page"));
  let pageSize = Number(req.param("pageSize"));
  let skip = (page - 1) * pageSize;
  let sort = req.param("sort");
  let params = {};
  let priceLevel = req.param("priceLevel");
  if (priceLevel != 'all') {
    let startPrice = '';
    let endPrice = '';
    switch (priceLevel) {
      case '0':
        startPrice = 0;
        endPrice = 100;
        break;
      case '1':
        startPrice = 100;
        endPrice = 500;
        break;
      case '2':
        startPrice = 500;
        endPrice = 1000;
        break;
      case '3':
        startPrice = 1000;
        endPrice = 5000;
        break;
    }
    params = {
      salePrice: {
        $gt: startPrice,
        $lte: endPrice
      }
    }
  }
  let goodsModel = goods
    .find(params)
    .skip(skip)
    .limit(pageSize);
  goodsModel.sort({'salePrice': sort});
  goodsModel.exec((err, doc) => {
    if (err) {
      res.json({status: "1", msg: err.message});
    } else {
      res.json({
        status: "0",
        msg: "",
        result: {
          count: doc.length,
          list: doc
        }
      });
    }
  });
});

// 加入购物车
router.post('/addCart', (req, res, next) => {
  const userId =req.cookies.userId,
    productId = req.body.productId;

  user.findOne({
    userId: userId
  }, (err1, userdoc) => {
    if (err1) {
      res.json({status: '1', msg: err1.message})
    } else {
      if (userdoc) {
        let goodsitem = '';
        userdoc
          .cartList
          .forEach(item => {
            if (item.productId == productId) {
              goodsitem = item;
              item.productNum++;
            }
          });
        if (goodsitem) {
          userdoc.save((err, doc) => {
            if (err) {
              res.json({status: '1', msg: err.message})
            } else {
              res.json({status: '0', msg: '', result: "success"})
            }
          })
        } else {
          goods.findOne({
            productId: productId
          }, (err2, doc2) => {
            if (err2) {
              res.json({status: '1', msg: err2.message})
            } else {
              if (doc2) {
                doc2.productNum = 1;
                doc2.checked = 1;
                userdoc
                  .cartList
                  .push(doc2);
                userdoc.save((err, doc) => {
                  if (err) {
                    res.json({status: '1', msg: err.message})
                  } else {
                    res.json({status: '0', msg: '', result: "success"})
                  }
                })
              }
            }
          })
        }
      }
    }
  })

})


module.exports = router;
