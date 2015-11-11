var urlTool = require('url');
var querystringTool = require('querystring');
var http = require('http');

var request = require('request');
var fs = require('fs-extra');
var cheerio = require('cheerio');

http.createServer(function(req, res) {
  router(req, res);
}).listen(4000);


var routerMap = {
  '/': index,
  '/baidu': baidu,
};

function router(req, res) {
  var pathname = urlTool.parse(req.url).pathname;
  var querystring = querystringTool.parse( urlTool.parse(req.url).query );

  console.log('request: ' + req.url);

  if (routerMap[pathname]) {
    routerMap[pathname](req, res, pathname, querystring);
  } else {
    res.writeHead(404);
    res.end();
  }
}

function index(req, res, pathname, querystring) {
  fs.createReadStream('./public/index.html').pipe(res);
}



function baidu(req, res, pathname, querystring) {
  var baseUrl = 'http://www.baidu.com/s?wd={{word}}&pn={{page}}';
  var word = querystring.word;
  var page = querystring.page;

  if (word) {
    word = encodeURIComponent(word);
    url = baseUrl.replace(/{{word}}/g, word).
                  replace(/{{page}}/g, (page - 1)*10);

    fetch(url, req, res);
  }
}

function transformHtmlEntities(str) {
  var ret = str.replace(/&nbsp;/g, ' ').
                replace(/&lt;/g, '<').
                replace(/&gt;/g, '>').
                replace(/&amp;/g, '&').
                replace(/&yen;/g, '¥');
  return ret;
}

function fetch(url, req, res) {
  request(url, function(err, baiduRes, body) {
    if (err) {
      console.log(err);
      res.writeHead(500);
      res.end(err.message);

    } else {
      var ret = [];
      var $ = cheerio.load(body, {decodeEntities: false});
      var resultOp = $('#content_left .result-op');
      var resultNormal = $('#content_left .result');

      resultOp.each(function() {
        var $this = $(this);
        var anchor = $this.find('.t a');
        var info = $this.find('.f13 .g');
        ret.push({
          href:anchor.attr('href'),
          text:anchor.text(),
          info:info.text(),
        });
      });

      resultNormal.each(function() {
        var $this = $(this);
        var anchor = $this.find('.t a');
        var info = $this.find('.f13 .g');
        ret.push({
          href:anchor.attr('href'),
          text:anchor.text(),
          info:info.text(),
        });
      });

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end( transformHtmlEntities( JSON.stringify(ret) ) );
    }
  });
}

