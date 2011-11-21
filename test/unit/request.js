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

describe("request", function () {
    var request = require(srcPath + 'request'),
        message = require(srcPath + 'message');

    beforeEach(function () {
        spyOn(console, "log");
        spyOn(message, "send");
    });

    describe("init", function () {
        it("can create a new request", function () {
            var req = request.init({
                    id: "ImTotallyUniqueISwear",
                    url: "http://www.rim.com"
                });

            expect(req.url).toBe("http://www.rim.com");
            expect(typeof req.allow).toEqual("function");
            expect(typeof req.deny).toEqual("function");
        });
    });

    describe("allow", function () {
        it("sends the appropriate message when allowing a request", function () {
            var req = request.init({
                    id: "ImTotallyUniqueISwear",
                    url: "http://www.rim.com"
                });

            req.allow();
            expect(message.send).toHaveBeenCalledWith("ResourceRequestedResponse", {
                id: "ImTotallyUniqueISwear",
                url: "http://www.rim.com",
                response: {
                    code: 200,
                    responseText: "allow"
                }
            });
        });
    });

    describe("deny", function () {
        it("sends the appropriate message when denying a request", function () {
            var req = request.init({
                    id: "ImTotallyUniqueISwear",
                    url: "http://www.rim.com"
                });

            req.deny();
            expect(message.send).toHaveBeenCalledWith("ResourceRequestedResponse", {
                id: "ImTotallyUniqueISwear",
                url: "http://www.rim.com",
                response: {
                    code: 403,
                    responseText: "deny"
                }
            });
        });
    });

    describe("substitute", function () {
        it("sends the appropriate message when marking a request as substitute", function () {
            var req = request.init({
                    id: "ImTotallyUniqueISwear",
                    url: "http://www.rim.com"
                });

            req.substitute();
            expect(message.send).toHaveBeenCalledWith("ResourceRequestedResponse", {
                id: "ImTotallyUniqueISwear",
                url: "http://www.rim.com",
                response: {
                    code: 100,
                    responseText: "substitute"
                }
            });
        });
    });

    describe("respond", function () {
        it("can takeover response to a request", function () {
            var req = request.init({
                    id: "ImTotallyUniqueISwear",
                    url: "http://www.rim.com"
                });

            req.substitute();
            req.respond(204, "No Content");
            expect(message.send).toHaveBeenCalledWith("ResourceRequestedResponse", {
                id: "ImTotallyUniqueISwear",
                url: "http://www.rim.com",
                response: {
                    code: 204,
                    responseText: "No Content"
                }
            });
        });

        it("throws an exception if substitute has not been requested before responding", function () {
            var req = request.init({
                    id: "ImTotallyUniqueISwear",
                    url: "http://www.rim.com"
                });

            expect(function () {
                req.respond(204, "No Content");
            }).toThrow();

            expect(message.send).not.toHaveBeenCalled();
        });

        it("throws an exception when a second request has not requested substitute before responding", function () {
            var req1 = request.init({
                    id: "ImTotallyUniqueISwear",
                    url: "http://www.rim.com"
                }),
                req2 = request.init({
                    id: "ImTotallyUniqueISwearToo",
                    url: "http://www.blackberry.com"
                });

            req1.substitute();

            expect(function () {
                req2.respond(204, "No Content");
            }).toThrow();
        });
    });
});  
