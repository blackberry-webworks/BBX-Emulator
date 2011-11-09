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
module.exports = {
    "RIPPLE_LOCATION": (require('os').platform() === 'win32') ?
        'C:\\Program Files\\Research In Motion\\Ripple 0.9.0.11\\Ripple.exe':
        '/Applications/Research In Motion/Ripple 0.9.0.11/Ripple.app/Contents/MacOS/Ripple',
    "HOST": "127.0.0.1",
    "PORT": 53533
};
