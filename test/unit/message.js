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

describe("message", function () {
    var message = require(srcPath + 'message');

    describe("when initializing", function () {
        it("registers for the correct events", function () {
            var socket =  {
                    on: jasmine.createSpy() 
                };

            message.init(socket);
            expect(socket.on.argsForCall[0][0]).toEqual("connect");
            expect(typeof socket.on.argsForCall[0][1]).toEqual("function");
            expect(socket.on.argsForCall[1][0]).toEqual("end");
            expect(typeof socket.on.argsForCall[1][1]).toEqual("function");
            expect(socket.on.argsForCall[2][0]).toEqual("data");
            expect(socket.on.argsForCall[2][1]).toEqual(message.receive);
        });
    });

    describe("when receiving events over the socket", function () {
        var event = require(srcPath + 'event');

        beforeEach(function () {
            spyOn(console, "log");
        });

        it("can hydrate the JSON payload and trigger the event", function () {
            var payload = {
                    event: "SomeEventName",
                    payload: "somePayload"
                };

            spyOn(event, "trigger");
            message.receive(JSON.stringify(payload));
            expect(event.trigger).toHaveBeenCalledWith(payload.event, [payload.payload]);
        });

        it("handles incomplete JSON payload", function () {
            var payload = {
                    event: "SomeEventName"
                };

            spyOn(event, "trigger");
            message.receive(JSON.stringify(payload));
            expect(console.log.mostRecentCall.args).toEqual(["JSON incomplete"]);
        });

        it("handles malformed JSON payload", function () {
            spyOn(event, "trigger");
            message.receive("{iambadjson:}");
            expect(console.log.mostRecentCall.args).toEqual(["Could not parse JSON"]);
        });
    });

    describe("when sending events over the socket", function () {
        var connect,
            end,
            socket,
            payload = {
                event: "SomeCoolEventName",
                payload: {
                    cool: "payload",
                    that: "does nothing"
                }
            };

        beforeEach(function () {
            socket = {
                write: jasmine.createSpy(),
                on: function (event, callback) {
                    if (event === 'connect') {
                        connect = callback;
                    }
                    else if (event === 'end') {
                        end = callback;
                    }
                }
            };
        });

        afterEach(function () {
            end();
        });

        it("can serialize the event into the correct JSON payload", function () {
            message.init(socket);
            connect();
            message.send(payload.event, payload.payload);
            expect(socket.write).toHaveBeenCalledWith(JSON.stringify(payload));
        });

        it("does not try to write to the socket when there is no connection", function () {
            message.init(socket);
            message.send(payload.event, payload.payload);
            expect(socket.write).not.toHaveBeenCalled();
        });

        it("does not try to write to the socket when there is no event", function () {
            message.init(socket);
            message.send(null, payload.payload);
            expect(socket.write).not.toHaveBeenCalled();
        });

        it("does not try to write to the socket when there is no payload", function () {
            message.init(socket);
            message.send(payload.event);
            expect(socket.write).not.toHaveBeenCalled();
        });
    });
});  
