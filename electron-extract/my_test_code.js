const os = require("os");
const { app, BrowserWindow, screen } = require('electron/main')

function telemetry () {
    const res = os.cpus()[0].model;
    return res;
}


os.cpus();
os.cpus()[0].model;
const primaryDisplay = electron.screen.getPrimaryDisplay()


