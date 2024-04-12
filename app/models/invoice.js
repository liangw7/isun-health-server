var mongoose = require('mongoose');

var invoiceSchema = new mongoose.Schema({
  // id & time info
  out_trade_no: {
    type: String
  },
  transaction_id: {
    type: String
  },
  time_end: {
    type: Date
  },
  out_refund_no: {
    type: String
  },
  refund_id: {
    type: String
  },
  time_refund: {
    type: Date
  },
  partner_trade_no: {
    type: String
  },
  transfer_id: {
    type: String
  },
  time_transfer: {
    type: Date
  },
  time_close: {
    type: Date
  },
  time_reverse: {
    type: Date
  },
  // prod & amount info
  product_id: {
    type: String
  },
  desc: {
    type: String
  },
  amount: {
    type: String
  },
  refundfee: {
    type: String
  },
  tranferfee: {
    type: String
  },
  // status & flag
  status: {
    type: String
  },
  code: {
    type: Number
  },
  return_msg: {
    type: String
  },
  // payer & payee info
  visitId: {
    type: String
  },
  patientId: {
    type: String
  },
  patient: {
    type: String
  },
  openId: {
    type: String
  },
  providerId: {
    type: String
  },
  provider: {
    type: String
  },
  popenId: {
    type: String
  },
  trade_type: {
    type: String
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('invoice', invoiceSchema);