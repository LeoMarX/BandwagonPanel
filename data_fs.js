var https = require("https");
var fs = require("fs");
var Key = require("./key");

var veid = Key.veid;
var apikey = Key.apikey;
var callAction = "getLiveServiceInfo";
// 定义文件上次修改时间
var lastQueryTime; 

var options = {
    host: "api.64clouds.com",
    port: 443,
    path: `/v1/${callAction}?veid=${veid}&api_key=${apikey}`
};

var callback = function(res) {

    var dataString = "";

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
            dataString += chunk;
        });

    res.on("end", function() {
        wirteFs(dataString);
        console.log(dataString.length);
    });
};

function wirteFs(data) {

    // 清除 email 数据
    data = JSON.parse(data);
    data["email"] = null;
    data = JSON.stringify(data);
    
    // 获取当前时间并赋值
    var d = new Date();
    var queryStatusTime = `${d.getMonth()+1}月${d.getDate()}日${d.getHours()}时${d.getMinutes()}分`;
    var param = `var _statusData = ${data};\n var _queryStatusTime = '${queryStatusTime}';`;
    
    fs.stat('status.js', function (err, stat) {
        if (err) {
            console.log(err);
        } else {
            // 获取 status.js 文件上次修改时间
            lastQueryTime = stat.mtime.getTime();
        }
    });

    // 限制查询频率，间隔大于 60 秒
    if(d.getTime() - lastQueryTime < 60000) {
        console.log("限制查询频率");
        console.log('modified time: ' + lastQueryTime);
        return;
    }

    fs.writeFile('status.js', param, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('ok.');
        }
    });
};

function getStatus(options) {    

        var req = https.request(options, callback);

        req.on('error', (e) => {
            console.log(`请求遇到问题: ${e.message}`);
        });

        req.end();
};

module.exports = {
    "options": options,
    "getStatus": getStatus
}