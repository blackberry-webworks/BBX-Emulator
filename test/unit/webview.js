var srcPath = __dirname + '/../../lib/';
describe("webview", function () {
    describe("create and destroy", function () {
        var webview = require(srcPath + 'webview'),
            constants = require(srcPath + 'constants'),
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
            spyOn(net, "Socket").andReturn(bridge);
            webview.create();
            expect(net.Socket).toHaveBeenCalled();
            expect(bridge.connect.argsForCall[0][0]).toEqual(constants.PORT);
            expect(bridge.connect.argsForCall[0][1]).toEqual(constants.HOST);
            expect(typeof bridge.connect.argsForCall[0][2]).toEqual("function");
            expect(bridge.on.argsForCall[1][0]).toEqual("data");
            expect(typeof bridge.on.argsForCall[1][1]).toEqual("function");
            expect(bridge.on.argsForCall[2][0]).toEqual("close");
            expect(typeof bridge.on.argsForCall[2][1]).toEqual("function");
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
            waits(501);
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
        var webview = require(srcPath + 'webview'),
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

        it("doesn't write to the socket if there is no connection", function () {
            spyOn(net, "Socket").andReturn(bridge);
            webview.create();
            webview.setURL("http://www.rim.com");
            expect(bridge.write).not.toHaveBeenCalled();
        });

        it("writes to the socket when connected", function () {
            var connected,
                bridge = {
                    connect: function (port, host, callback) {
                        connected = callback;
                    },
                    on: jasmine.createSpy(),
                    write: jasmine.createSpy()
                };

            spyOn(net, "Socket").andReturn(bridge);
            webview.create();
            connected();
            webview.setURL("http://www.github.com");
            expect(bridge.write).toHaveBeenCalledWith("http://www.github.com");
        });
    });
});  
