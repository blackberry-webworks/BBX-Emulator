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
            var req = request.init("http://www.rim.com");

            expect(req.url).toBe("http://www.rim.com");
            expect(typeof req.allow).toEqual("function");
            expect(typeof req.deny).toEqual("function");
        });
    });

    describe("allow", function () {
        it("sends the appropriate message when allowing a request", function () {
            var req = request.init("http://www.rim.com");
            req.allow();
            expect(message.send).toHaveBeenCalledWith("ResourceRequestedResponse", {
                url: "http://www.rim.com",
                response: "allow"
            });
        });
    });

    describe("deny", function () {
        it("sends the appropriate message when denying a request", function () {
            var req = request.init("http://www.rim.com");
            req.deny();
            expect(message.send).toHaveBeenCalledWith("ResourceRequestedResponse", {
                url: "http://www.rim.com",
                response: "deny"
            });
        });
    });
});  
