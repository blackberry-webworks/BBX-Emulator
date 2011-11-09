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
var event = require('./event'),
    connected = false,
    bridge,
    _self;

_self = {
    init: function (socket) {
        bridge = socket;

        bridge.on('connect', function () {
            connected = true;
        });

        bridge.on('end', function () {
            connected = false;
        });

        bridge.on('data', _self.receive);
    },

    send: function (event, payload) {
        if (bridge && connected && event && payload) {
            var message = {
                event: event,
                payload: payload
            };

            bridge.write(JSON.stringify(message));
        }
    },

    receive: function (data) {
        try {
            var obj = JSON.parse(data);
            if (obj.event && obj.payload) {
                event.trigger(obj.event, obj.payload);
            }
            else {
                console.log("JSON incomplete");
            }
        }
        catch (e) {
            console.log("Could not parse JSON");
        }
    }
};

module.exports = _self;
