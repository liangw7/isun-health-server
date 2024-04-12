const https = require("https"),
  request = require("request"),
  cfg = require('../../config/common').config;

const {
  Wechat
} = require('wechat-jssdk');

const {
  WechatClient
} = require('messaging-api-wechat');

const wx = new Wechat(cfg.wechat);

/**
 * 微信授权登录流程
 * 1：用户访问公众号页面。
 * 2：回调授权。
 * 3：用户同意授权。
 * 4：重定向到公众号，并返回code。
 * 5：公众号通过code获取网页授权access_token。
 * 6：刷新access_token。
 * 7：公众号通过access_token来获取用户信息。
 */

exports.sendwxMessage = async (appID, appSecret, postData) => {
  let tokenUrl = `${cfg.wxapi.token}?appid=${appID}&secret=${appSecret}&grant_type=client_credential`;

  console.log(tokenUrl)
  return https.get(tokenUrl, res => {
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      body = JSON.parse(body);
      let options = {
        method: 'post',
        body: postData, // Javascript object
        json: true,      // Use,If you are sending JSON data
        url: `${cfg.wxapi.send}?access_token=${body.access_token}`,
        headers: {
          // Specify headers, If any
        }
      }
      console.log('token:', body.access_token)
      request(options, function (err, res, body) {
        console.log('message option', options)
        if (err) {
          console.log('Error :', err)
          return
        }
        console.log(' Body :', body)

      });
    });
  })
}

exports.wcAuth = (req, resp) => {
  console.log('wechat access .....')
  let weCharUrl = `${cfg.wxapi.access_token}?appid=${req.body.appID}&secret=${req.body.appSecret}` +
    `&code=${req.body.code}&grant_type=authorization_code`;

  https.get(weCharUrl, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      body = JSON.parse(body);
      console.log('wechat access', body);
      resp.json(body);

    });
  })
}

exports.wcSignature = (req, res) => {
  //console.log ('wx',wx)
  wx.jssdk.getSignature(req.body.url).then(signatureData => {
    // console.log('req.query.url',req.body.url) 
    // console.log('signatureData',signatureData) 
    res.json(signatureData);
  });
}


exports.wcUserInfo = (req, resp) => {
  let weCharUrl = `${cfg.wxapi.userinfo}?access_token=${req.body.accessToken}&openid=${req.body.openID}`;

  https.get(weCharUrl, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      body = JSON.parse(body);
      //  console.log(body);
      resp.json(body);

    });
  })
}

exports.wcLink = (req, resp) => {
  let tokenUrl = `${cfg.wxapi.token}?appid=${req.body.appID}&secret=${req.body.appSecret}&grant_type=client_credential`;

  https.get(tokenUrl, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      body = JSON.parse(body);
      //  console.log(body);
      resp.json(body);

    });
  })
}


exports.wcTicket = (req, resp) => {
  let ticketUrl = `${cfg.wxapi.getticket}?access_token=${req.body.accessToken}&type=jsapi`;

  https.get(ticketUrl, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      body = JSON.parse(body);
      // console.log(body);
      resp.json(body);

    });
  })
}

exports.wcMessage = (req, resp) => {

  sendwxMessage(req.body.appID, req.body.appSecret,
    {
      touser: req.body.openID,
      msgtype: "text",
      text: {
        content: req.body.message
      }
    }).then((err, res) => {
      resp.json({ code: 200, message: 'wechat message is sent' })
    });
}


exports.wcMessageLink = function (req, resp) {

  sendwxMessage(req.body.appID, req.body.appSecret,
    {
      touser: req.body.openID,
      msgtype: "news",
      news: {
        articles: [{
          title: req.body.title,
          description: req.body.message,
          url: req.body.url,
          picurl: req.body.picUrl
        }]
      }
    }).then((err, res) => {
      resp.json({ code: 200, message: 'wechat message is sent' })
    });
}

exports.wcMessageTest = (req, resp) => {
  //   console.log ('req.body.wechsatID',req.body.wechatID)
  let filter = {
    wechatID: "liangw7",
    appID: req.body.appID, //"wx1456c566ec3e6686",
    appSecret: req.body.appSecret //"8ada6bb8a95c8d79abf7a374688aa9cd"
  };
  const wclient = WechatClient.connect({
    appId: filter.appID,
    appSecret: filter.appSecret,
  });

  wclient.sendText(filter.wechatID, 'this is a test').catch(error => {
    console.log(error); // formatted error message
    //console.log(error.stack); // error stack trace
    //console.log(error.config); // axios request config
    //console.log(error.request); // HTTP request
    console.log(error.response); // HTTP response;
  });
}