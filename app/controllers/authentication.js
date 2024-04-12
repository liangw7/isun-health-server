var jwt = require('jsonwebtoken');
var User = require('../models/user');
var authConfig = require('../../config/auth');
var Util = require('../utils/util');
var cfg = require('../../config/common').config;

function generateToken(user) {
    return jwt.sign(user, authConfig.secret, {
        expiresIn: 10800 // 设置token过期时间3小时
    });
}

function setUserInfo(request) {
    return {
        _id: request._id,
        email: request.email,
        role: request.role
    };
}

exports.login = function (req, res, next) {
    console.log('ok1')
    var userInfo = setUserInfo(req.user);

    res.status(200).json({
        token: 'JWT ' + generateToken(userInfo),
        //user: userInfo
        user: req.user
    });
    //console.log (res,'res')
}

exports.register = function (req, res, next) {

    var email = req.body.email;
    var password = req.body.password;
    var role = req.body.role;
    console.log('role---', role);
    if (!email) {
        return res.status(422).send({ error: 'You must enter an email address' });
    }

    if (!password) {
        return res.status(422).send({ error: 'You must enter a password' });
    }
    let params = null;
    if (role == 'provider') {
        params = {
            "$and": [
                {
                    role: { "$in": cfg.healthCareWorkerRoles }
                },
                { email: email }
            ]
        }
    } else if (role == 'patient' || role == 'admin') {
        params = {
            email: email,
            role: role
        }
    }

    User.findOne(params, function (err, existingUser) {

        if (err) {
            console.log('----err----');
            console.log(err);
            return next(err);
        }

        if (existingUser) {
            console.log('----existingUser----');
            console.log(existingUser);
            return res.status(422).send({ error: 'That email address is already in use' });
        }

        // var user = new User({
        //     email: email,
        //     password: password,
        //     role: role
        //  });
        // var user = new User(req.body);
        //   var user = new User(user);


        User.create(req.body, function (err, user) {

            if (err) {
                return next(err);
            }

            var userInfo = setUserInfo(user);

            res.status(201).json({
                token: 'JWT ' + generateToken(userInfo),
                user: user

            })
            console.log(res, 'res')
        });
    });

}

/**
 * 注册家庭成员
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.registerFamliy = function (req, res, next) {
    var str = Util.out_trade_no();
    req.body.email = str + '@db.com';
    req.body.password = str;
    if (!req.body.father_id) {
        res.json({ code: -1, msg: '没有关联的账户信息' });
        return res.status(422).send({ error: '没有关联的账户信息' });
    }
    User.create(req.body, function (err, user) {
        if (err) {
            res.json({ code: -1, msg: '添加家庭成员失败' + err });
        }
        console.log('----registerFamliy----', user);
        res.json({ code: 1, msg: '添加家庭成员成功', data: user });
    });
}

exports.roleAuthorization = function (roles) {

    return function (req, res, next) {

        var user = req.user;

        User.findById(user._id, function (err, foundUser) {

            if (err) {
                res.status(422).json({ error: 'No user found.' });
                return next(err);
            }

            if (roles.indexOf(foundUser.role) > -1) {
                return next();
            }

            res.status(401).json({ error: 'You are not authorized to view this content' });
            return next('Unauthorized');

        });
    }
}