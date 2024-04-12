const tenpay = require('tenpay'),
  Util = require('../utils/util'),
  Invoice = require('../models/invoice'),
  Visit = require('../models/visit'),
  cfg = require('../../config/common').config,
  crypto = require('crypto');

/* invoice fields: 
mandatory:    visitId, patientId, providerId, amounts
automic:      out_trade_no, out_refund_no, partner_trade_no,  status, code
query:        patient, provider, openId, popenId
optional:     prodcutId, desc
transactionID: transaction_id, refund_id, transfer_id
Test openId:  oN_YY0y3EEXFItLEZ4_ai59104wY
*/

/* sandbox
const api = await tenpay.sandbox(config);
tenpay.init(config, true).getSignkey().then((res) => {
  const key = res.sandbox_signkey;
  this.wxpay = tenpay.init(Object.assign(config, {partnerKey: key, sandbox: true}), true);
}).catch((err) => {
  throw err;
});
*/
// 方式一
// const api = new tenpay(config, true);
const api = tenpay.init(cfg.wxpay, cfg.debug);
exports.wxmiddleware = api.middlewareForExpress;

const STATUS = {
  err_pay: '支付错误',
  err_refund: '退款错误',
  err_transfer: '企业付款错误',
  prepay: '统一下单',
  paid: '支付成功',
  refund: '申请退款',
  refunded: '退款成功',
  reverse: '撤消订单',
  close: '关闭订单',
  transfered: '企业付款成功'
}


const TRADE_STATE = {
  success: 'SUCCESS',// 支付成功
  refund: 'REFUND',// 转入退款
  notpay: 'NOTPAY',// 未支付
  closed: 'CLOSED',// 已关闭（付款码支付）
  userpaying: 'USERPAYING',// 用户支付中（付款码支付）
  payerror: 'PAYERROR',// 支付失败(其他原因，如银行返回失败)
  accept: 'ACCEPT',// 已接收，等待扣款
  revoked: 'REVOKED'// 已撤销（付款码支付）
}

const REFUND_STATE = {
  success: 'SUCCESS',// 退款成功
  closed: 'CLOSED',// 退款关闭
  processing: 'PROCESSING', // 退款处理中
  abnormal: 'ABNORMAL' // 退款异常
}


const CODE = {
  err_pay: -1,
  err_refund: -2,
  err_transfer: -3,
  prepay: 1,
  paid: 2,
  refund: 3,
  refunded: 4,
  reverse: 5,
  close: 6,
  transfered: 7
}

function total_fee(amount) {
  // 微信支付的金额是不带小数位的，所有的小数金额都必须*100转为正整数
  // 数值先会被小数点后2位截断或补足，然后转为整数字符串
  // 8.8     => 8.80 => 880
  // 9.24678 => 9.25 => 925
  // or  invoice.amount * 100,//订单金额(分),
  // return (amount).toFixed(2).replace(".", "");
  let m = 0;
  let s1 = String(amount);
  let s2 = '100';
  try { m += s1.split(".")[1].length } catch (e) { }
  try { m += s2.split(".")[1].length } catch (e) { }
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

/**
 * 根据调用wxResult(info)方法,获取解析后的微信端参数,如果为空说明支付成功
 * @param {解析后的微信端参数} result 
 * @returns 
 */
function isSuccess(result) {
  return Util.isEmpty(result);
}

function reqId(invoice) {
  return invoice.transaction_id ||
    invoice.out_trade_no ||
    invoice.visitId ||
    invoice.refund_id ||
    invoice.partner_trade_no;
}

/**
 * 解析微信端参数,如果成功返回空,否则返回异常信息
 * 只是判断返回是否成功,交易是否成功需要后续进行处理
 * @param {微信端参数} info 
 * @returns 
 */
function wxResult(info) {
  if (info.return_code == 'FAIL') {
    return {
      return_msg: info.return_msg
    };
  } else if (info.result_code && info.result_code != 'SUCCESS') {
    return {
      return_msg: `${info.err_code}, ${info.err_code_des}`
    };
  } else {
    return {};
  }
}


/**
 * 根据微信异步通知或主动查询时的参数,处理系统业务逻辑,返回拼接值
 * @param {微信异步通知或主动查询时的参数} info 
 * @returns 
 */
function resolve(info) {
  let dataset = wxResult(info);
  let flag = isSuccess(dataset);
  dataset = {
    transaction_id: info.transaction_id,
    time_end: new Date(),
    trade_type: info.trade_type,
    openId: info.openid,
  }
  if (flag) {
    // 此处根据返回的交易状态封装入参
    if (info.trade_state) {
      if (info.trade_state == TRADE_STATE.success) {
        dataset = {
          ...dataset,
          status: STATUS.paid,
          code: CODE.paid
        }
      } else if (info.trade_state == TRADE_STATE.refund) {
        dataset = {
          ...dataset,
          status: STATUS.refund,
          code: CODE.refund
        }
      } else if (info.trade_state == TRADE_STATE.closed ||
        info.trade_state == TRADE_STATE.revoked) {
        dataset = {
          ...dataset,
          status: STATUS.close,
          code: CODE.close
        }
      } else if (info.trade_state == TRADE_STATE.payerror) {
        dataset = {
          ...dataset,
          status: STATUS.err_pay,
          code: CODE.err_pay
        }
      } else if (info.trade_state == TRADE_STATE.notpay ||
        info.trade_state == TRADE_STATE.userpaying ||
        info.trade_state == TRADE_STATE.accept) {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
    // dataset = {
    //   ...dataset,
    //   status: STATUS.close,
    //   code: CODE.close
    // }
  }
  return dataset;
}


/**
 * 根据微信异步通知或主动查询时的参数,处理系统业务逻辑,返回拼接值
 * @param {微信异步通知或主动查询时的参数} info 
 * @returns 
 */
function resolveRefund(info) {
  let dataset = wxResult(info);
  let flag = isSuccess(dataset);
  dataset = {
    time_refund: new Date(),
    refund_id: info.refund_id_0,
  }
  if (flag) {
    // 此处根据返回的交易状态封装入参
    if (info.refund_status_0) {
      if (info.refund_status_0 == REFUND_STATE.success) {
        dataset = {
          ...dataset,
          status: STATUS.refunded,
          code: CODE.refunded
        }
      } else if (info.refund_status_0 == REFUND_STATE.closed ||
        info.trade_state == TRADE_STATE.revoked) {
        dataset = {
          ...dataset,
          status: STATUS.close,
          code: CODE.close
        }
      } else if (info.refund_status_0 == REFUND_STATE.abnormal) {
        dataset = {
          ...dataset,
          status: STATUS.err_refund,
          code: CODE.err_refund
        }
      } else if (info.refund_status_0 == REFUND_STATE.processing) {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
    // dataset = {
    //   ...dataset,
    //   status: STATUS.close,
    //   code: CODE.close
    // }
  }
  return dataset;
}

/*  payload required for createInvoice 
{
  "out_trade_no": "rnhxmu31j8",
  "patientId": "5e3a4aa2999c5278112ec3a6",
  "patient": "Ray Chen",
  "openId": "oN_YY0y3EEXFItLEZ4_ai59104wY", //付款用户的openid
  "providerId": "5e36418932839457695090e4",
  "provider": "Liang Wu",
  "popenId": "oN_YY0y3EEXFItLEZ4_ai59104wY",
  "visitId": "22222",
  "amount": 1.0,          // 微信支付的金额
  "desc": "cloud visit", // '商品简单描述',
  "product_id": "13443432"
}
*/
// out_trade_no is add to payload,  which is from prepay data
exports.createInvoice = (req, res) => {
  let invoice = {
    ...req.body,
    status: STATUS.prepay,
    code: CODE.prepay
  }
  Invoice.create(invoice, (err, data) => {
    if (err) {
      res.json({
        code: 500,
        message: `错误创建微信订单: ${invoice.out_trade_no}, ${err}`
      });
    } else {
      res.json({
        code: 200,
        message: `创建微信订单: ${invoice.out_trade_no}`
      });
    }
  });
}

/* payload is data obj retruned by wxpay, example for trnasfer
  data: {
    out_trade_no: doc.out_trade_no,
    partner_trade_no: invoice.partner_trade_no,
    tranferfee: invoice.tranferfee,
    transfer_id: params.payment_no,
    time_transfer: params.payment_time,
    status: STATUS.transfered,
    code: CODE.transfered
  },
*/
exports.updateInvoice = (req, res) => {
  let info = req.body;
  if (info.out_trade_no) {
    let out_trade_no = info.out_trade_no;
    delete info.out_trade_no;

    Invoice.findOneAndUpdate({
      out_trade_no: out_trade_no
    }, {
      $set: info
    }, (err, data) => {
      if (err) {
        console.log('err----' + err);
        res.json({
          code: 500,
          message: `错误更新订单: ${out_trade_no}, ${err}`
        })
      } else {
        res.json({
          code: 200,
          message: `成功更新订单: ${out_trade_no}`
        })
      }
    });
  } else {
    res.json({
      code: 500,
      message: `入参错误,没有out_trade_no参数`
    })
  }
}

/*  payload required for getPayParams:
{
  "openId": "oN_YY0y3EEXFItLEZ4_ai59104wY", //付款用户的openid
  "amount": 1.0,          // 微信支付的金额
  "desc": "cloud visit", // '商品简单描述'
}
*/
// trade_type - 默认JSAPI  获取微信JSSDK支付参数(自动下单, 兼容小程序)
exports.getPayParams = (req, res) => {
  // 业务逻辑...
  let out_trade_no = Util.out_trade_no();
  api.getPayParams({
    out_trade_no: out_trade_no, // auto-generating
    body: req.body.desc, // '商品简单描述',
    total_fee: total_fee(req.body.amount), // 微信支付的金额
    openid: req.body.openId, //付款用户的openid
    trade_type: req.body.trade_type
  }).then((params) => {
    console.log('getPayParams成功!');
    console.log(params);
    res.json({
      code: 200,
      out_trade_no: out_trade_no,
      data: params
    });
  }).catch((err) => {
    console.log('getPayParams失败!' + err);
    res.json({
      code: 500,
      // out_trade_no: out_trade_no,
      message: `错误获取JSSDK支付参数 - ${err}`
    })
  });
}

/*  payload required for unifiedOrder:
{
  "openId": "oN_YY0y3EEXFItLEZ4_ai59104wY", //付款用户的openid
  "amount": 1.0,          // 微信支付的金额
  "desc": "cloud visit", // '商品简单描述',
  "product_id": "13443432" // product_id
}
*/
// trade_type - 默认JSAPI  微信统一下单
// payload is the same as getPayParams
exports.unifiedOrder = function (req, res) {
  // 业务逻辑...
  let out_trade_no = Util.out_trade_no();
  api.unifiedOrder({
    out_trade_no: out_trade_no,
    body: req.body.desc, // '商品简单描述',
    total_fee: total_fee(req.body.amount),
    openid: req.body.openId, //付款用户的openid
    // MWEB: H5 支付,  NATIVE：扫码支付 | APP：原生支付
    trade_type: req.body.trade_type,
    // ip: 47.101.41.210
    // spbill_create_ip: '47.101.41.210',
    // product_id: req.body.product_id
  }).then((params) => {
    console.log('unifiedOrder------params');
    console.log(params);
    res.json({
      code: 200,
      out_trade_no: out_trade_no,
      data: params
    });
  }).catch((err) => {
    res.json({
      code: 500,
      // out_trade_no: out_trade_no,
      message: `错误统一下单 - ${err}`
    })
  });
}

// https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_7&index=8s
// wexin pay callback
// 商户订单支付失败需要生成新单号重新发起支付，要对原订单号调用关单，避免重复支付
exports.notify = (req, res) => {
  // let info = req.weixin;
  // console.log('weixin pay notify:', info);
  // // 调用异步通知处理逻辑
  // let dataset = wxNotifyResult(info);
  // res.json(dataset);
  let info = req.weixin;
  console.log('weixin pay notify:', info)

  let dataset = resolve(info);

  if (dataset) {
    Invoice.findOneAndUpdate({
      out_trade_no: info.out_trade_no
    }, {
      $set: dataset
    }, (err, data) => {
      // acknowledge wexin
      if (err) {
        console.log(`错误更新支付结果: ${info.out_trade_no}, ${err}`)
        res.reply('错误更新订单');
      } else {
        //  console.log(`更新支付结果通知: ${info.out_trade_no}`)
        // close order if fail, never resubmit  payment
        if (dataset.code == CODE.close) {
          api.closeOrder(req.body).then((params) => {
            // console.log(`关闭订单: ${info.out_trade_no}`)
            res.reply();
          }).catch((err) => {
            console.log(`错误关闭订单: ${info.out_trade_no}, ${err}`)
            res.reply('错误关闭订单');
          });
        }
      }
    });
  } else {
    res.reply();
  }
}

// https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_16&index=11
//wexin refund callback
//SUCCESS - update status = refunded, otherwise leave status = refund
// and update the return_msg, need manually to handle
exports.notifyRefund = (req, res) => {
  // let info = req.weixin;
  // console.log('weixin refund notify:', info)
  // // 调用异步通知处理逻辑
  // let dataset = wxNotifyResult(info);
  // res.json(dataset);
  let info = req.weixin;
  console.log('weixin refund notify:', info)

  let dataset = wxResult(info);
  if (isSuccess(dataset)) {
    dataset = (info.refund_status == 'SUCCESS') ? {
      refund_id: info.refund_id,
      time_refund: new Date(),
      refundfee: info.settlement_refund_fee,
      status: STATUS.refunded,
      code: CODE.refunded
    } : {
      return_msg: info.refund_status
    }
  }

  Invoice.findOneAndUpdate({
    out_trade_no: info.out_trade_no
  }, {
    $set: dataset
  }, (err, data) => {
    // acknowledge wexin
    if (err) {
      console.log(`错误更新退款订单: ${info.out_trade_no}, ${err}`)
      res.reply("错误更新订单");
    } else {
      console.log(`退款结果通知: ${info.out_trade_no}`)
      res.reply();
    }
  });
}

/* payload
{
  "out_trade_no": "13434314"
}
*/
exports.orderQuery = (req, res) => {
  // transaction_id, out_trade_no 二选一
  // transaction_id: '微信的订单号',
  var visitId = req.body.visitId;
  console.log('orderQuery 入参');
  console.log(req.body.visitId);
  delete req.body.visitId;
  api.orderQuery(req.body).then((data) => {
    // 订单查询成功处理内部业务逻辑
    let info = data;
    console.log('系统订单号为:' + info.out_trade_no + ',微信主动查询返回结果:', info);
    if (visitId) {
      var visitParams = {
        out_trade_no: info.out_trade_no,
      }
      Visit.findOneAndUpdate({
        _id: visitId
      }, {
        $set: visitParams
      }, (err, data) => {
        console.log('Visit findOneAndUpdate');
        // acknowledge wexin
        if (err) {
          console.log(`错误更新Visit结果: ${info.out_trade_no}, ${err}`)
          res.json({
            code: 500,
            message: `主动查询更新支付结果失败 - ${err}`
          });
        } else {
          let dataset = resolve(info);

          if (dataset) {
            // 根据返回结果更新订单状态,关闭或成功
            Invoice.findOneAndUpdate({
              out_trade_no: info.out_trade_no
            }, {
              $set: dataset
            }, (err, data) => {
              console.log('Invoice findOneAndUpdate');
              // acknowledge wexin
              if (err) {
                console.log(`错误更新支付结果: ${info.out_trade_no}, ${err}`)
                res.json({
                  code: 500,
                  message: `主动查询更新支付结果失败 - ${err}`
                });
              } else {
                console.log(`更新支付结果通知: ${info.out_trade_no}`)
                // close order if fail, never resubmit  payment
                if (dataset.code == CODE.close) {
                  api.closeOrder(req.body).then((params) => {
                    // console.log(`关闭订单: ${info.out_trade_no}`)
                    res.json({
                      code: 200,
                      message: `关闭订单成功`,
                      out_trade_no: info.out_trade_no,
                      data: dataset
                    });
                  }).catch((err) => {
                    console.log(`错误关闭订单: ${info.out_trade_no}, ${err}`)
                    res.json({
                      code: 500,
                      message: `错误关闭订单 - ${err}`
                    });
                  });
                } else {
                  res.json({
                    code: 200,
                    message: `查询支付结果成功`,
                    out_trade_no: info.out_trade_no,
                    data: dataset
                  });
                }
              }
            });
          } else {
            res.json({
              code: 200,
              message: `查询支付结果成功`,
              out_trade_no: info.out_trade_no,
              data: dataset
            });
          }
        }
      });
    }

  }).catch((err) => {
    res.json({
      code: 500,
      message: `查询订单状态失败 - ${err}`
    })
  });
}

/* payload
{
  "out_trade_no": "13434314"
  "visitId": "234234325" // or
}
*/
// 支付交易返回失败或支付系统超时，调用该接口撤销交易。如果此订单用户支付失败，
// 微信支付系统会将此订单关闭；如果用户支付成功，微信支付系统会将此订单资金退还给用户。
exports.reverse = (req, res) => {
  // transaction_id, out_trade_no 二选一
  // transaction_id: '微信的订单号', or visitId
  let id = reqId(req.body);
  Invoice.findOne(req.body, {
    out_trade_no: 1
  }, (err, doc) => {
    if (err) {
      res.json({
        code: 500,
        message: `错误发现订单号: ${id}, ${err}`
      })
    } else if (doc) {
      api.reverse(req.body).then((params) => {
        Invoice.findOneAndUpdate({
          out_trade_no: doc.out_trade_no
        }, {
          $set: {
            status: STATUS.reverse,
            code: CODE.reverse,
            time_reverse: (new Date()).toISOString()
          }
        }, (err, data) => {
          if (err) {
            res.json({
              code: 500,
              data: {
                out_trade_no: doc.out_trade_no,
                status: STATUS.reverse,
                code: CODE.reverse,
                time_reverse: (new Date()).toISOString()
              },
              message: `错误更新撤消订单: ${doc.out_trade_no}, ${err}`
            });
          } else {
            res.json({
              code: 200,
              message: `成功撤消订单: ${doc.out_trade_no}`
            });
          }
        });
      }).catch((err) => {
        res.json({
          code: 500,
          message: `错误撤消订单 - ${err}`
        })
      });
    } else {
      res.json({
        code: 500,
        message: `微信订单号: ${id} 不存在`
      })
    }
  });
}

/* payload
{
  "out_trade_no": "13434314"
  "visitId": "234234325" // or
}
*/
// 商户订单支付失败需要生成新单号重新发起支付，要对原订单号调用关单，避免重复支付
// 用户支付超时，系统退出不再受理，避免用户继续，请调用关单接口。
exports.close = (req, res) => {
  // transaction_id, out_trade_no 二选一
  // transaction_id: '微信的订单号', or visitId
  let id = reqId(req.body);
  Invoice.findOne(req.body, {
    out_trade_no: 1
  }, (err, doc) => {
    if (err) {
      res.json({
        code: 500,
        message: `错误发现订单: ${id}, ${err}`
      })
    } else if (doc) {
      api.closeOrder(req.body).then((params) => {
        Invoice.findOneAndUpdate({
          out_trade_no: doc.out_trade_no
        }, {
          $set: {
            status: STATUS.close,
            code: CODE.close,
            time_close: (new Date()).toISOString()
          }
        }, (err, data) => {
          if (err) {
            res.json({
              code: 500,
              data: {
                out_trade_no: doc.out_trade_no,
                status: STATUS.close,
                code: CODE.close,
                time_close: (new Date()).toISOString()
              },
              message: `错误更新关闭订单: ${doc.out_trade_no}, ${err}`
            });
          } else {
            res.json({
              code: 200,
              message: `成功关闭订单: ${doc.out_trade_no}`
            });
          }
        });
      }).catch((err) => {
        res.json({
          code: 500,
          message: `错误关闭订单 - ${err}`
        })
      });
    } else {
      res.json({
        code: 500,
        message: `微信订单号: ${id} 不存在`
      })
    }
  });
}

/* payload
{
  "visitId": '132213213",
  "out_trade_no": "13434314",   // or
  "transaction_id": "22333333"  // or
  "out_refund_no": "3333333" // if available
  "refundfee": 1.0
}
*/
// https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_4
// 一笔退款失败后重新提交，请不要更换退款单号，请使用原商户退款单号
exports.refund = (req, res) => {
  // transaction_id, out_trade_no 二选一
  // transaction_id: '微信的订单号', or visitId
  console.log('refund req.body', req.body)
  let invoice = req.body;
  let id = reqId(invoice);
  invoice.out_refund_no = invoice.out_refund_no || Util.out_trade_no();

  Invoice.findOne({
    $and: [{
      out_trade_no: invoice.out_trade_no
    },
    {
      code: CODE.paid
    }
    ]
  }, (err, doc) => {
    if (err) {
      res.json({
        code: 500,
        message: `错误发现订单: ${id}, ${err}`
      })
    } else if (doc) {
      console.log('refund doc' + doc);
      api.refund({
        out_trade_no: doc.out_trade_no,
        out_refund_no: invoice.out_refund_no, // '商户内部退款单号',
        total_fee: total_fee(doc.amount), // total_fee(Number(doc.amount)), //订单金额(分),
        refund_fee: total_fee(doc.amount) // total_fee(Number(invoice.refundfee)) ||total_fee(Number( doc.amount ))// '退款金额(分)'
      }).then((params) => {
        console.log('refund api result' + params);
        Invoice.findOneAndUpdate({
          out_trade_no: doc.out_trade_no
        }, {
          $set: {
            status: STATUS.refund,
            code: CODE.refund,
            out_refund_no: invoice.out_refund_no,
            refund_fee: invoice.refundfee
          }
        }, (err, data) => {
          if (err) {
            res.json({
              code: 500,
              data: {
                out_trade_no: doc.out_trade_no,
                status: STATUS.refund,
                code: CODE.refund,
                out_refund_no: invoice.out_refund_no,
                refund_fee: invoice.refundfee
              },
              message: `错误更新退款订单: ${doc.out_trade_no}, ${err}`
            });
          } else {
            res.json({
              code: 200,
              data: params,
              message: `成功申请退款: ${doc.out_trade_no}`
            });
          }
        });
      }).catch((err) => {
        return res.json({
          code: 500,
          invoice: doc,
          out_refund_no: invoice.out_refund_no,
          message: `错误申请退款 - ${err}`
        })
      });
    } else {
      res.json({
        code: 500,
        message: `微信订单号: ${id} 不存在`
      })
    }
  });
}

/* payload
{
  "out_trade_no": "13434314"
}
*/
exports.refundQuery = (req, res) => {
  // 以下参数 四选一
  // transaction_id: '微信的订单号',
  // out_trade_no: '商户内部订单号',
  // out_refund_no: '商户内部退款单号',
  api.refundQuery(req.body).then((data) => {
    // 退款订单查询成功处理内部业务逻辑
    let info = data;
    console.log('系统退款订单号为:' + info.out_refund_no_0 + ',微信退款主动查询返回结果:', info);
    let dataset = resolveRefund(info);
    if (dataset) {
      // 根据返回结果更新订单状态,是否退款成功
      Invoice.findOneAndUpdate({
        out_trade_no: info.out_trade_no
      }, {
        $set: dataset
      }, (err, data) => {
        console.log('Invoice refund findOneAndUpdate');
        // acknowledge wexin
        if (err) {
          console.log(`错误更新退款结果: ${info.out_refund_no_0}, ${err}`)
          res.json({
            code: 500,
            out_trade_no: info.out_trade_no,
            message: `主动查询更新退款结果失败 - ${err}`
          });
        } else {
          console.log(`更新退款结果通知: ${info.out_refund_no_0}`)
          // close order if fail, never resubmit  payment
          if (dataset.code == CODE.close) {
            api.closeOrder(req.body).then((params) => {
              // console.log(`关闭订单: ${info.out_trade_no}`)
              res.json({
                code: 200,
                message: `退款关闭订单成功`,
                out_trade_no: info.out_trade_no,
                data: dataset
              });
            }).catch((err) => {
              console.log(`退款错误关闭订单: ${info.out_refund_no_0}, ${err}`)
              res.json({
                code: 500,
                out_trade_no: info.out_trade_no,
                message: `退款错误关闭订单 - ${err}`
              });
            });
          } else {
            res.json({
              code: 200,
              message: `查询退款结果成功`,
              out_trade_no: info.out_trade_no,
              out_refund_no: info.out_refund_no_0,
              data: dataset
            });
          }
        }
      });
    } else {
      res.json({
        code: 200,
        message: `退款中...`,
        out_trade_no: info.out_trade_no,
        out_refund_no: info.out_refund_no_0,
        data: dataset
      });
    }
  }).catch((err) => {
    res.json({
      code: 500,
      message: `退款查询----查询退款订单----错误发现退款订单, ${err}`
    })
  });
}

/* payload
{
  "prepay_id": "13434314"
}
*/
// 获取微信JSSDK支付参数(通过预支付会话标识, 兼容小程序)
exports.getPayParamsByPrepay = async (req, res) => {
  // 该方法需先调用api.unifiedOrder统一下单, 获取prepay_id;
  try {
    let data = await api.getPayParamsByPrepay(req.body)
    res.json({
      code: 200,
      data: data
    })
  } catch (err) {
    res.json({
      code: 500,
      message: `错误通过预支付获取JSSDK参数 - ${err}`
    })
  }
}

/* payload
{
  "bill_date": "2018-02-01 04:21:23"
}
*/
exports.downloadBill = (req, res) => {
  /**
   * 新增一个format参数(默认: false), 用于自动转化帐单为json格式
   * json.total_title: 统计数据的标题数组 - ["总交易单数","总交易额","总退款金额", ...],
   * json.total_data: 统计数据的数组 - ["3", "88.00", "0.00", ...],
   * json.list_title: 详细数据的标题数组 - ["﻿交易时间","公众账号ID","商户号", ...],
   * json.list_data: 详细数据的二维数据 - [["2017-12-26 19:20:39","wx12345", "12345", ...], ...]
   */
  api.downloadBill({
    bill_date: req.body.bill_date
  }, true).then((data) => {
    res.json({
      code: 200,
      data: data
    });
  }).catch((err) => {
    res.json({
      code: 500,
      message: `错误下载对帐单 - ${err}`
    })
  });
}

/* payload
{
  "bill_date": "2018-02-01 04:21:23"
}
*/
exports.downloadFundflow = (req, res) => {
  /**
   * 新增一个format参数(默认: false), 用于自动转化帐单为json格式
   * json.total_title: 统计数据的标题数组 - ["资金流水总笔数","收入笔数","收入金额", ...],
   * json.total_data: 统计数据的数组 - ["20.0", "17.0", "0.35", ...],
   * json.list_title: 详细数据的标题数组 - ["记账时间","微信支付业务单号","资金流水单号", ...],
   * json.list_data: 详细数据的二维数据 - [["2018-02-01 04:21:23","12345", "12345", ...], ...]
   */
  // '账单日期'
  api.downloadFundflow({
    bill_date: req.body.bill_date
  }, true).then((data) => {
    res.json({
      code: 200,
      data: data
    });
  }).catch((err) => {
    res.json({
      code: 500,
      message: `错误下载资金帐单 - ${err}`
    })
  });
}

//--------------------------------------------------------
// the following funct are not used by now
//--------------------------------------------------------

/*  payload required for getAppParams:
{
  "amount": 1.0,          // 微信支付的金额
  "desc": "cloud visit", // '商品简单描述'
}
*/
// trade_type - APP  获取APP支付参数(自动下单)
exports.getAppParams = (req, res) => {
  console.log(req);
  let out_trade_no = Util.out_trade_no();
  console.log(out_trade_no);
  api.getAppParams({
    out_trade_no: out_trade_no,
    body: req.body.desc, // '商品简单描述',
    total_fee: total_fee(req.body.amount) // 订单金额(分)
  }).then((params) => {
    res.json({
      code: 200,
      out_trade_no: out_trade_no,
      data: params,
    });
  }).catch((err) => {
    return res.json({
      code: 500,
      message: `错误获取APP支付参数 - ${err}`
    })
  });
}

/* payload
{
  "prepay_id": '324324'
}
*/
// 获取APP支付参数(通过预支付会话标识)
exports.getAppParamsByPrepay = async (req, res) => {
  // 该方法需先调用api.unifiedOrder统一下单<注意传入trade_type: 'APP'>, 获取prepay_id;
  try {
    let data = await api.getAppParamsByPrepay({
      prepay_id: req.body.prepay_id
    })
    res.json({
      code: 200,
      data: data
    })
  } catch (err) {
    res.json({
      code: 500,
      message: `错误通过预支付获取APP参数 - ${err}`
    })
  }
}

/*  payload required for getNativeUrl:
{
  "product_id": "oN_YY0y3EEXFItLEZ4_ai59104wY", 
}
*/
// getNativeUrl: 扫码支付(模式一)
exports.getNativeUrl = (req, res) => {
  let out_trade_no = Util.out_trade_no()
  api.getNativeUrl({
    product_id: req.body.product_id // '商品ID'
  }).then((params) => {
    res.json({
      code: 200,
      out_trade_no: out_trade_no,
      data: params
    });
  }).catch((err) => {
    return res.json({
      code: 500,
      message: `错误扫码支付(模式一) - ${err}`
    })
  });
}

/**
 * payload required for unifiedOrderNative:
 * 统一下单接口:扫码支付(模式二)
 * @param {*} req {"product_id": "13434314", "amount": 订单金额, "desc": "商品描述"}
 * @param {*} res 
 */
exports.unifiedOrderNative = (req, res) => {
  // 使用统一下单API可直接获取code_url, 需自行生成二维码图片
  let out_trade_no = Util.out_trade_no()
  api.unifiedOrder({
    out_trade_no: out_trade_no,
    body: req.body.desc, // '商品简单描述',
    total_fee: total_fee(req.body.amount), //订单金额(分)
    trade_type: 'NATIVE',
    product_id: req.body.product_id
  }).then((params) => {
    res.json({
      code: 200,
      out_trade_no: out_trade_no,
      data: params
    });
  }).catch((err) => {
    return res.json({
      code: 500,
      message: `错误扫码支付(模式二) - ${err}`
    })
  });
}

/*  payload required for micropay:
{
  "amount": 1.0,          // 微信支付的金额
  "desc": "cloud visit", // '商品简单描述'
}
*/
// micropay: 刷卡支付
exports.micropay = (req, res) => {
  let out_trade_no = Util.out_trade_no()
  api.micropay({
    out_trade_no: out_trade_no,
    body: req.body.desc, // '商品简单描述',
    total_fee: total_fee(req.body.amount), //订单金额(分)
    auth_code: '' //'授权码'
  }).then((params) => {
    res.json({
      code: 200,
      out_trade_no: out_trade_no,
      data: params
    });
  }).catch((err) => {
    return res.json({
      code: 500,
      message: `错误刷卡支付 - ${err}`
    })
  });
}

/* payload for transfers API
{
  "visitId": "241242342343",
  "out_trade_no": "5e3a4aa2999c5278112ec3a6",  // or
  "partner_trade_no" :"1112233444"  // if available
 //  "provider": "Liang Wu",
 // "popenId": "oN_YY0y3EEXFItLEZ4_ai59104wY",
  "tranferfee": 100,
  "desc": "transfered to doctor",
}
*/
// https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_2
// 一笔企业付款失败后重新提交， 请不要更换商户订单号，一定要使用原商户订单号重试
exports.transfers = (req, res) => {
  let invoice = req.body;
  let id = reqId(invoice);
  invoice.partner_trade_no = invoice.partner_trade_no || Util.out_trade_no()

  Invoice.findOne({
    $and: [{
      $or: [{
        visitId: invoice.visitId
      }, {
        out_trade_no: invoice.out_trade_no
      }, {
        transaction_id: invoice.transaction_id
      }]
    },
    {
      code: CODE.paid
    }
    ]
  }, {
    out_trade_no: 1,
    provider: 1,
    popenId: 1
  }, (err, doc) => {
    if (err) {
      res.json({
        code: 500,
        message: `错误发现订单: ${id}, ${err}`
      })
    } else if (doc) {
      var transfer = {
        partner_trade_no: invoice.partner_trade_no,
        openid: doc.popenId,
        re_user_name: doc.provider,
        amount: invoice.tranferfee,
        desc: invoice.desc
      }
      console.log('transfer doc ', transfer)
      api.transfers(transfer).then((params) => {
        Invoice.findOneAndUpdate({
          out_trade_no: doc.out_trade_no
        }, {
          $set: {
            partner_trade_no: invoice.partner_trade_no,
            tranferfee: invoice.tranferfee,
            transfer_id: params.payment_no,
            time_transfer: params.payment_time,
            status: STATUS.transfered,
            code: CODE.transfered
          }
        }, (err, data) => {
          if (err) {
            res.json({
              code: 500,
              data: {
                out_trade_no: doc.out_trade_no,
                partner_trade_no: invoice.partner_trade_no,
                tranferfee: invoice.tranferfee,
                transfer_id: params.payment_no,
                time_transfer: params.payment_time,
                status: STATUS.transfered,
                code: CODE.transfered
              },
              message: `错误更新企业付款订单: ${doc.out_trade_no}, ${err}`
            });
          } else {
            res.json({
              code: 200,
              message: `成功企业付款: ${doc.out_trade_no}`
            })
          }
        })
      }).catch((err) => {
        console.log('transfer request ', req.body);
        return res.json({
          code: 500,
          partner_trade_no: invoice.partner_trade_no,
          message: `错误企业付款 ${doc.out_trade_no} - ${err}`
        })
      })
    }
  })
}

exports.transfersQuery = (req, res) => {
  //partner_trade_no: '商户内部付款订单号'
  api.transfersQuery(req.body).then((data) => {
    res.json({
      code: 200,
      data: data
    });
  }).catch((err) => {
    res.json({
      code: 500,
      message: `错误发现企业付款订单号 - ${err}`
    })
  });
}