var express = require('express'),
    app = express.createServer(),
    nowjs = require('now'),
    webview = require('./webview'),
    everyone;

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/../pub'));
});

app.get('/webview/create', function (req, res, next) {
    var webview = require('./webview');
    webview.create();
    res.send('Webview Created');
});

app.listen(8472);

console.log('Server running at http://localhost:8472');

everyone = nowjs.initialize(app); 
everyone.now.webview = webview;
webview.init(everyone.now);
