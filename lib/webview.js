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
var childProcess = require('child_process'),
    constants = require('./constants'),
    util = require('util'),
    net = require('net'),
    ripple = null,
    bridge = null,
    connected = false,
    _self;

function _spawn(proc, args, done) {
    var cmd = childProcess.spawn(proc, args);
    cmd.stdout.on('data', util.print);
    cmd.stderr.on('data', util.print);
    if (done) {
        cmd.on('exit', done);
    }
    return cmd;
}

_self = {
    create: function (ready) {
        function _connect() {
            bridge = new net.Socket();
            bridge.connect(constants.PORT, constants.HOST, function () {
                console.log("Connected to webview");
                connected = true;
                if (ready && typeof ready === 'function') {
                    ready();
                }
            });
            bridge.on('error', function (e) {
                if (e.code === 'ECONNREFUSED') {
                    connected = false;
                    setTimeout(function () {
                        if (!connected) {
                            bridge.end();
                            bridge = null;
                            bridge = new net.Socket();
                            _connect();
                        }
                    }, 500);
                }
            });
            // Add a 'data' event handler for the bridge socket
            // data is what the webview sent to this socket
            bridge.on('data', function (data) {
                console.log('DATA: ' + data);
                //We will need to handle data from the webview here
                //e.g. allowRequestedResource
            });

            // Add a 'close' event handler for the bridge socket
            bridge.on('close', function () {
                console.log('Connection closed');
            });
        }

        if (!ripple) {
            ripple = _spawn(constants.RIPPLE_LOCATION, null, function () {
                ripple = null;
                console.log("Ripple shutting down...");
                if (bridge && connected) {
                    console.log("Closing connection to webview");
                    bridge.end();
                    bridge = null;
                    connected = false;
                }
            }); 
            console.log("Launching Ripple...");
            _connect();
        }
        else {
            console.log("Ripple is already open");
        }
    },

    destroy: function () {
        if (ripple) {
            ripple.kill();
        }
        connected = false;
        ripple = null;
    },

    setURL: function (url) {
        if (bridge && connected) {
            bridge.write(url);
        }
    }
};

module.exports = _self;
