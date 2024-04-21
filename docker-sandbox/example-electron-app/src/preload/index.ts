import { contextBridge, ipcRenderer} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { totalmem } from 'os';

// Custom APIs for renderer
const api = {
  getCpus: () => {
    return new Promise((resolve, reject) => {
      // Send IPC message to the main process to get CPU information
      ipcRenderer.send('get-cpus');

      // Listen for the response from the main process
      ipcRenderer.once('return-cpus', (event, cpus) => {
        resolve(cpus);
      });
    });
  },
  getHostname: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("get-hostname");

      ipcRenderer.once("return-hostname", (event, hostname) => {
        resolve(hostname);
      })
    })
  },
  getRelease: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("get-release");

      ipcRenderer.once("return-release", (event, release) => {
        resolve(release);
      });
    });
  },
  getVersion: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("get-version");

      ipcRenderer.once("return-version", (event, version) => {
        resolve(version);
      });
    });
  },
  getTotalmem: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("get-totalmem");

      ipcRenderer.once("return-totalmem", (event, totalmem) => {
        resolve(totalmem);
      });
    });
  },
  getPrimaryDisplay: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-primary-display');

      ipcRenderer.once('return-primary-display', (event, display) => {
        resolve(display);
      });
    });
  },
  getAllDisplays: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("get-all-displays");

      ipcRenderer.once("return-all-displays", (event, displays) => {
        resolve(displays);
      });
    });
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
