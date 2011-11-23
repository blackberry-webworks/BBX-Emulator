/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var express = require('express'),
    app = express.createServer(),
    webview = require('../lib/webview');

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/../pub'));
});

app.get('/testing/headers', function (req, res, next) {
    var log = ""; 
    log += "Value of req.header('hydra') = " + req.header("hydra") + " <br/>\n";
    log += "Value of req.header('typhon') = " + req.header("typhon");
    console.log(log);
    res.send(log);
});

app.listen(8472);

console.log('Server running at http://localhost:8472');

webview.create(function () {
    webview.setCustomHeaders({
        typhon: "that crazy hundred headed monster from greek mythology",
        hydra: "more multi-headedness"
    });

    webview.setURL("http://localhost:8472/testing/headers");
});
