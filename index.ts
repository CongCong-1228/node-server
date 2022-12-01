import http, { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import p from "path";
import url from "url";

const server = http.createServer();
// __dirname获取当前目录
const publicDir = p.resolve(__dirname, "public");

server.on("request", (request, response) => {
    const { url: path } = request;
    const { pathname } = url.parse(path as string);
    let filename = pathname?.substring(1) as string;
    if (filename === "") {
        filename = "index.html";
    }
    fs.readFile(p.resolve(publicDir, filename), (error, data) => {
        if (error) {
            // 文件不存在
            if (error.errno === -4058) {
                response.statusCode = 404;
                fs.readFile(
                    p.resolve(publicDir, "404.html"),
                    (error404, data404) => {
                        response.end(data404);
                    }
                );
            }
            // 访问的是目录
            else if (error.errno === -4068) {
                response.statusCode = 403;
                response.end("无权访问目录");
            }
            // 其他错误，一般为服务器出错
            else {
                response.statusCode = 500;
                response.end("服务器出错，请稍后再试");
            }
        } else {
            // 添加缓存
            response.setHeader("Cache-Control", "public, max-age=604800");
            response.end(data);
        }
    });
});

server.listen(8888);
