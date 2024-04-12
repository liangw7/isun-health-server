//muyangshu setting

const https = require("https");
const request = require ('request');
const xml2js = require('xml2js');
const crypto = require('crypto');
const cfg = require('../../config/common').config;
const AppSecret='5f6458c9e44ebe97ba4f780bb765532d';
const AppId='wxc45beee3f426ebc1'
const weUrl = 'https://api.weixin.qq.com/cgi-bin/token';
const apiKey = cfg.wechat.apiKey;

const openAIURL = 'https://www.yichanghealth.com/api/v1/chat/completions';


exports.getMessagee = async function (req, resp) {

  //const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
  //AppId + '&secret=' + AppSecret;
  const tokenUrl = `${weUrl}?grant_type=client_credential&appid=${AppId}&secret=${AppSecret}`;
  var buffer = [];
  //监听 data 事件 用于接收数据
  req.on('data',function(data){
      buffer.push(data);
  });
  req.on('end',function(){
       console.log(Buffer.concat(buffer).toString('utf-8'));
       const xml = Buffer.concat(buffer).toString('utf-8');
     //  conver xml to json
       parseXml(xml).then((dataxml)=>{
        const { ToUserName, FromUserName, MsgType, Content } = dataxml;
        //get token
          https.get(tokenUrl, res => {
            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
              body += data;
            });
            res.on("end", () => {
              const access_body = JSON.parse(body);
              console.log('I have wechat access*********', access_body);
              //got access

              
             
                  // response within 5 seconds
                  var weCharUrl = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' +
                  access_body.access_token;
   
                  var postData = {
                   touser: FromUserName,
                   msgtype: "text",
                   text:{content: ''}
                 };
   
                 var options = {
                   method: 'post',
                   body: postData, // Javascript object
                   json: true, // Use,If you are sending JSON data
                   url: weCharUrl,
                   headers: {
                     // Specify headers, If any
                   }
                 }
                  request(options, function (err, response, body) {
                   console.log('message option', options)
                   if (err) {
                     console.log('Error :', err)
                     return
                   }
                   console.log('resp body from wechat*****', body)
                 //  resp.status('200').send(body)
                 resp.send('success')
   
                 });


                  //talk to ai
              var AIData={
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": Content}],
                "temperature": 0.7
              }
              var AIoptions={
                rejectUnauthorized: false,
                method: 'post',
                body: AIData, // Javascript object
                json: true, // Use,If you are sending JSON data
                url: openAIURL,
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                }
              }
              request(AIoptions, function (err, response, body) {
                console.log('start to connect to AI*********', response.body)
                if (err) {
                  console.log('Error :', err)
                  return
                }
          
              if(response.body&&response.body.choices){
              let AIResp=response.body.choices[0].message.content;
              var weCharUrl = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' +
              access_body.access_token;

              
              var postData = {
                touser: FromUserName,
                msgtype: "text",
                text:{content: AIResp}
              };

              var options = {
                method: 'post',
                body: postData, // Javascript object
                json: true, // Use,If you are sending JSON data
                url: weCharUrl,
                headers: {
                  // Specify headers, If any
                }
              }
              //send message
              request(options, function (err, response, body) {
                console.log('message option', options)
                if (err) {
                  console.log('Error :', err)
                  return
                }
                console.log('resp body from wechat*****', body)
              //  resp.status('200').send(body)
              resp.send('success')

              });
              }
         
               })
            })
          })
        })
})
}
exports.getMessageevoid = async function (req, res) {
  //get wechat messaeg

  var buffer = [];
  //监听 data 事件 用于接收数据
  req.on('data',function(data){
      buffer.push(data);
  });
  //监听 end 事件 用于处理接收完成的数据
  req.on('end',function(){
  //输出接收完成的数据   

       console.log(Buffer.concat(buffer).toString('utf-8'));
       const xml = Buffer.concat(buffer).toString('utf-8');
        //parse xml message
         parseXml(xml).then((dataxml)=>{
          console.log('coming messge----:',dataxml )
          handleWeChatMessage(dataxml).then((data)=>{
            console.log('got here', data)
            res.set('Content-Type', 'text/xml');
            res.send('success');
          });
       
         });
         //send message to wechat
       
  });

 
};

exports.setup = function(req,resp){
  console.log("授权: ", req);
    let signature = req.query.signature;
    let echostr = req.query.echostr;
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;

    let reqArray = [nonce, timestamp, 'alex2015']; // process.env.WX_TOKEN对应填写服务器配置内的 Token

    reqArray.sort(); //对数组进行字典排序
    let sortStr = reqArray.join(''); //连接数组
    let sha1Str = sha1(sortStr.toString().replace(/,/g,""));
    if (signature === sha1Str) {
        resp.end(echostr);
    } else {
        resp.end("false");
        console.log("授权失败!");
    }
};

//进行sha1加密
function sha1(str) {
  let shasum = crypto.createHash("sha1");
  return shasum.update(str,'utf-8').digest("hex");
}

function parseXml(xml) {
  return new Promise((resolve, reject)=>{
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
    const result = parser.parseStringPromise(xml);
    parser.parseString(xml, (error, result) => {
      if (error) {
        console.error(error);
      } else {
       
        let xmlOut=result.xml;
        resolve(xmlOut);
        reject('err')
      }
    });
   
  })
  
}
function handleWeChatMessage(message) {
  return new Promise((resolve, reject)=>{
  const { ToUserName, FromUserName, MsgType, Content } = message;

  let reply;
  let txt='test';
  //get response from openai
 // txt = await getAI(Content);

console.log('coming content----:',Content )
  switch (MsgType) {
    case 'text':
      reply = {
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: txt
      };
      break;

    case 'image':
      reply = {
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: txt
      };
      break;

    default:
      reply = {
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: '抱歉，暂不支持该类型的消息'
      };
      break;
  }

  //buid reply in xml
  console.log('reply====', reply)
 // const xml = buildXml(reply);
 // console.log('XML====', xml)
  getAccessToken().then((data)=>{
    const accessToken = data;
    sendmess (reply, accessToken).then((data)=>{
      resolve(data);
      reject('eer')
    }) 

 
  })
})
}

function sendmess (mess, accessToken) {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`,
      body: JSON.stringify(mess)
    }, function (error, response) {
      if (error) {
        console.log('接口返回错误', error)
        reject(error.toString())
      } 
      else {
        console.log('response.body====', response.body)
      
        resolve(response.body)
      }
    })
  })
}
function sendWeChatMessage(xml) {

  const url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send';

  getAccessToken().then((data)=>{
    const accessToken = data;
 
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' }
  };
 
    const req = https.request(`${url}?access_token=${accessToken}`, options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
        console.log('res data on ', data)
      });
      res.on('end', () => {
        console.log('res data end ', data)
     

      });
    }); // Replace with your function to get the access token
    req.on('error', error => {
      console.log('error')
      reject(error);
    });
    req.write(xml);
    req.end();
 
});

}


function getAccessToken() {
  return new Promise ((resolve, reject)=>{
    const weCharUrl=`${weUrl}?grant_type=client_credential&appid=${AppId}&secret=${AppSecret}`;
    https.get(weCharUrl, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
          console.log(body);
        
        resolve(body.access_token);
      });
    })
  })

}


function buildXml(message) {
  const builder = new xml2js.Builder({ rootName: 'xml', cdata: true });
  const xml = builder.buildObject({ xml: message });
  return xml;
}


async function getAI(prompt) {
  

  const data = {
   // "model": "davinci-codex",
   "model": "gpt-4",
    "prompt": prompt,
    "temperature": 0.7
  };
  const options = {
    hostname: 'https://www.yichanghealth.com',
  //  port: 443,
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  };
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
  
    res.on('data', d => {
      process.stdout.write(d);

     // return res.data.choices[0].text;
    });
  });
  
  req.on('error', error => {
    console.error(error);
  });
  
  req.write(data);
  req.end();
 
}


