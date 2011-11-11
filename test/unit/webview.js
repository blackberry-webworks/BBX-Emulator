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
var srcPath = __dirname + '/../../lib/';

describe("webview", function () {
    var webview = require(srcPath + 'webview');

    describe("create and destroy", function () {
        var constants = require(srcPath + 'constants'),
            childProcess = require('child_process'),
            net = require('net'),
            ripple,
            bridge;

        beforeEach(function () {
            ripple = {
                stdout: {
                    on: jasmine.createSpy()
                },
                stderr: {
                    on: jasmine.createSpy()
                },
                on: jasmine.createSpy(),
                kill: jasmine.createSpy()
            };
            bridge = {
                connect: jasmine.createSpy(),
                on: jasmine.createSpy(),
                end: jasmine.createSpy(),
                write: jasmine.createSpy()
            };
            spyOn(childProcess, "spawn").andReturn(ripple);
            spyOn(console, "log");
        });

        afterEach(function () {
            webview.destroy();
        });

        it("can spawn a webview", function () {
            spyOn(net, "Socket").andReturn(bridge);
            webview.create();
            expect(childProcess.spawn).toHaveBeenCalled();
            expect(childProcess.spawn.argsForCall[0][0]).toEqual(constants.RIPPLE_LOCATION);
        });

        it("can destroy a webview", function () {
            var bridge = {
                connect: function (port, host, callback) {
                    callback();
                },
                on: jasmine.createSpy(),
                end: jasmine.createSpy()
            };

            spyOn(net, "Socket").andReturn(bridge);
            webview.create();
            webview.destroy();
            expect(ripple.kill).toHaveBeenCalled();
        });

        it("closes the socket connection when webview is destroyed", function () {
            var exit,
                connected,
                bridge = {
                    connect: function (port, host, callback) {
                        connected = callback;
                    },
                    on: jasmine.createSpy(),
                    end: jasmine.createSpy()
                };

            ripple.on = function (event, callback) {
                if (event === 'exit') {
                    exit = callback;
                }
            };

            ripple.kill = function () {
                exit();
            };

            spyOn(net, "Socket").andReturn(bridge);
            webview.create();
            connected();
            webview.destroy();
            expect(bridge.end).toHaveBeenCalled();
        });

        it("only spawns one webview at a time", function () {
            spyOn(net, "Socket").andReturn(bridge);
            webview.create();
            webview.create();
            expect(childProcess.spawn.callCount).toEqual(1);
        });

        it("opens a bridge connection", function () {
            var message = require(srcPath + 'message');
            spyOn(message, "init");
            spyOn(net, "Socket").andReturn(bridge);
            
            webview.create();

            expect(net.Socket).toHaveBeenCalled();
            expect(message.init).toHaveBeenCalledWith(bridge);
            expect(bridge.connect.argsForCall[0][0]).toEqual(constants.PORT);
            expect(bridge.connect.argsForCall[0][1]).toEqual(constants.HOST);
            expect(typeof bridge.connect.argsForCall[0][2]).toEqual("function");
            expect(bridge.on.argsForCall[0][0]).toEqual("error");
            expect(typeof bridge.on.argsForCall[0][1]).toEqual("function");
            expect(bridge.on.argsForCall[1][0]).toEqual("close");
            expect(typeof bridge.on.argsForCall[1][1]).toEqual("function");
        });

        it("tries to reconnect when a connection error occurs", function () {
            var error,
                bridge = {
                    connect: jasmine.createSpy(),
                    on: function (event, callback) {
                        if (event === "error") {
                            error = callback;
                        }
                    },
                    end: jasmine.createSpy()
                };

            spyOn(net, "Socket").andReturn(bridge);
            webview.create();
            expect(typeof error).toEqual("function");

            error({code: "ECONNREFUSED"});
            waits(510);
            runs(function () {
                expect(bridge.connect.callCount).toEqual(2);
                expect(bridge.end.callCount).toEqual(1);
            });
        });

        it("calls the ready callback once a connection has been established", function () {
            var ready = jasmine.createSpy(), 
                connected,
                bridge = {
                    connect: function (port, host, callback) {
                        connected = callback;
                    },
                    on: jasmine.createSpy()
                };

            spyOn(net, "Socket").andReturn(bridge);
            webview.create(ready);
            connected();
            expect(ready).toHaveBeenCalled();
        });

    });

    describe("setURL", function () {
        var message = require(srcPath + 'message');
       
        it("sends the WebviewUrlChangeRequest  message", function () {
            spyOn(message, "send");

            webview.setURL("http://www.github.com");
            expect(message.send).toHaveBeenCalledWith("WebviewUrlChangeRequest", "http://www.github.com");
        });
    });

    describe("onRequest", function () {
        var childProcess = require('child_process'),
            net = require('net'),
            event = require(srcPath + 'event'),
            ripple;

        beforeEach(function () {
            ripple = {
                stdout: {
                    on: jasmine.createSpy()
                },
                stderr: {
                    on: jasmine.createSpy()
                },
                on: jasmine.createSpy(),
                kill: jasmine.createSpy()
            };
            spyOn(childProcess, "spawn").andReturn(ripple);
            spyOn(console, "log");
        });

        afterEach(function () {
            webview.destroy();
        });

        it("can register for and invoke callback", function () {
            var callback = jasmine.createSpy(),
                connected,
                bridge = {
                    connect: function (port, host, callback) {
                        connected = callback;
                    },
                    on: jasmine.createSpy()
                };

            spyOn(net, "Socket").andReturn(bridge);

            webview.create();
            connected();
            webview.onRequest(callback);
            event.trigger("ResourceRequested", ["http://www.blackberry.com"], true);
            expect(callback).toHaveBeenCalled();
        });

        it("can deregister for callback", function () {
            var callback = jasmine.createSpy(),
                connected,
                bridge = {
                    connect: function (port, host, callback) {
                        connected = callback;
                    },
                    on: jasmine.createSpy()
                };

            spyOn(net, "Socket").andReturn(bridge);

            webview.create();
            connected();
            webview.onRequest(callback);
            webview.onRequest(null);
            event.trigger("ResourceRequested", ["http://www.blackberry.com"], true);
            expect(callback).not.toHaveBeenCalled();
        });

        it("allows the request if no callback is registered", function () {
            var request = require(srcPath + 'request'),
                connected,
                bridge = {
                    connect: function (port, host, callback) {
                        connected = callback;
                    },
                    on: jasmine.createSpy()
                },
                req = {
                    allow: jasmine.createSpy(),
                    deny: jasmine.createSpy()
                };

            spyOn(net, "Socket").andReturn(bridge);
            spyOn(request, "init").andReturn(req);

            webview.create();
            connected();
            webview.onRequest(null);
            event.trigger("ResourceRequested", ["http://www.blackberry.com"], true);
            expect(req.allow).toHaveBeenCalled();
            expect(req.deny).not.toHaveBeenCalled();
        });
    });
});  
