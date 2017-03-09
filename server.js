var http = require('http');
var fs = require('fs');
var url = require('url');
var mime = require('mime');

var queryData = require("./data_fs");

http.createServer(function(request, response) {

    var fileType;
    var pathname = url.parse(request.url).pathname;
    
    if(pathname == "/") {
        pathname = "/index.html";
    }

    // 只允许获取 js 文件中 “status.js”
    if(pathname.lastIndexOf(".js") !== -1 && pathname.indexOf("status.js") === -1) {
        response.writeHead(404, {'content-Type': 'text/html'});
        response.write("<h1 style='text-align: center;'>404 Not Found <br /> ㄟ( ▔ _ ▔ )ㄏ</h1>");
        response.end();
        return ;
    }
    console.log("Request for " + pathname + " received.");

    // 输出数据
    fs.readFile(pathname.substr(1), function(err, data) {

        if(err) {
            console.log(err);
            response.writeHead(404, {'content-Type': 'text/html'});
            response.write("<h1 style='text-align: center;'>404 Not Found <br /> ┑(￣Д ￣)┍</h1>");
        } else {
            fileType = mime.lookup(pathname);
            console.log(fileType);
            response.writeHead(200, {'content-Type': fileType });

            // 获取 API 数据
            if(fileType.lastIndexOf("html") !== -1) {
                queryData.getStatus(queryData.options);
            }

            if(fileType.indexOf("image") !== -1) {
                console.log(data.length);
                response.write(data);
            } else {
                response.write(data.toString());
            }
        }

        response.end();
    });
}).listen(8080);

console.log("server running at localhost:8080");
