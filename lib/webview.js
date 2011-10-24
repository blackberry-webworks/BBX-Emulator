var childProcess = require('child_process'),
    RIPPLE_LOCATION = '/Applications/Research In Motion/Ripple 0.9.0.11/Ripple.app/Contents/MacOS/Ripple',
    sys = require('sys'),
    ripple = null,
    _self;

function _spawn(proc, args, done) {
    var cmd = childProcess.spawn(proc, args);
    cmd.stdout.on('data', sys.print);
    cmd.stderr.on('data', sys.print);
    if (done) {
        cmd.on('exit', done);
    }

    return cmd;
}

_self = {
    create: function (done) {
        if (!ripple) {
            ripple = _spawn(RIPPLE_LOCATION, null, function () {
                ripple = null;
                console.log("Ripple shutting down...");
                if (done && typeof done === 'function') {
                    done();
                }
            }); 
            console.log("Launching Ripple...");
        }
        else {
            console.log("Ripple is already open");
        }
    },

    destroy: function () {
        if (ripple) {
            ripple.kill();
        }
        ripple = null;
    }
};

module.exports = _self;
