var MasterVisit = require('../models/masterVisit');
const mongoose = require('mongoose');

/**
 * 获取所有的住院信息
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAllMasterVisits = function (req, res, next) {
    MasterVisit.find(function (err, Visits) {
        if (err) {
            res.send(err);
        }
        res.json(Visits);
    });
}

/**
 * 根据创建时间倒序查询对应条件的住院信息
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getMasterVisitsByFilter = function (req, res, next) {

    console.log('req.body', req.body)

    MasterVisit.find(req.body, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        res.json(data);

        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    }).sort({ "createdAt": 'desc' });


}

exports.update = function (req, res) {

    MasterVisit.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, data) {
            if (err) {
                res.json({ code: -1, msg: '修改失败' + err });
            }
            console.log('-----update-----findByIdAndUpdate-----data:' + data);
            if (data) {
                res.json({ code: 1, msg: '修改成功' });
            } else {
                res.json({ code: -1, msg: '修改失败' });
            }
        });
}

exports.create = function (req, res) {

    MasterVisit.create((req.body),
        function (err, data) {
            if (err) {
                res.json({ code: -1, msg: '创建失败' + err });
            }
            console.log('-----create-----create-----data:' + data);
            if (data) {
                res.json({ code: 1, msg: '创建成功' });
            } else {
                res.json({ code: -1, msg: '创建失败' });
            }
        });
}