var Todo = require('../models/todo');

/**
 * 获取所有todo信息
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getTodos = function (req, res, next) {

    Todo.find(function (err, todos) {
        if (err) {
            res.send(err);
        }
        res.json(todos);

    });
}

/**
 * 根据todo id获取todo信息
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getById = function (req, res, next) {

    Todo.findById({ _id: req.params.id }, function (err, Upload) {
        if (err) {
            res.send(err);
        }
        res.json(Upload);
    });
}

/**
 * 根据前端自己拼接的查询条件获取todo信息
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getByFilter = function (req, res, next) {

    Todo.find(req.body, function (err, data) {
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
    });
}

/**
 * 根据patientID获取todo信息
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getTodosByPatient = function (req, res, next) {

    Todo.find({ patientID: req.params.patientID }, function (err, data) {
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
    });
}

/**
 * 根据providerID获取todo信息
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getTodosByProvider = function (req, res, next) {

    Todo.find({ providerID: req.params.providerID }, function (err, data) {
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
    });
}

/**
 * 根据requesterID获取todo信息
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getTodosByRequester = function (req, res, next) {

    Todo.find({ requesterID: req.params.requesterID }, function (err, data) {
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
    });
}

/**
 * 更新todo
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updateTodo = function (req, res, next) {

    console.log('request', req.body)
    Todo.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

/**
 * 创建todo
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createTodo = function (req, res, next) {
    console.log('request', req.body)
    Todo.create(req.body, function (err, Todo) {
        if (err) {
            res.send(err);
        }
        res.json(Todo);
    });
}

/**
 * 删除todo
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.deleteTodo = function (req, res, next) {

    Todo.remove({
        _id: req.params.todoID
    }, function (err, Todo) {
        res.json(Todo);
    });

}