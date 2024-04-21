import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import React, { useState, useEffect } from 'react';


function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const [cpus, setCpus] = useState([{"model": null}]);
  const [primaryDisplay, setPrimaryDisplay] = useState(null);
  const [allDisplays, setAllDisplays] = useState(null);
  const [hostname, setHostname] = useState(null);
  const [release, setRelease] = useState(null);
  const [version, setVersion] = useState(null);
  const [totalmem, setTotalmem] = useState(null);


  useEffect(() => {
    window.api.getCpus()
      .then(cpusData => {
        console.log('CPUs:', cpusData);
        setCpus(cpusData);
      })
      .catch(error => {
        console.error('Failed to load CPU data:', error);
      });
  }, []);

  useEffect(() => {
    window.api.getPrimaryDisplay()
    .then(displayData => {
      console.log("Primary Display:", displayData);
      setPrimaryDisplay(displayData);
    })
    .catch(error => {
      console.error("Failed to get primary display data:", error);
    });
  }, []);

  useEffect(() => {
    window.api.getAllDisplays()
    .then(displayData => {
      console.log("All displays: ", displayData);
      setAllDisplays(displayData);
    })
    .catch(error => {
      console.error("Failed to get all display data:", error);
    });
  }, []);

  useEffect(() => {
    window.api.getHostname()
    .then(hostname => {
      console.log("Hostname: ", hostname);
      setHostname(hostname);
    })
    .catch(error => {
      console.error("Failed to get hostname:", error);
    })
  }, []);

  useEffect(() => {
    window.api.getRelease()
    .then(release => {
      console.log("Release: ", release);
      setRelease(release);
    })
    .catch(error => {
      console.error("Failed to get release:", error);
    });
  }, []);

  useEffect(() => {
    window.api.getVersion()
    .then(version => {
      console.log("Version: ", version);
      setVersion(version);
    })
    .catch(error => {
      console.error("Failed to get version:", error);
    });
  }, []);

  useEffect(() => {
    window.api.getTotalmem()
    .then(totalmem => {
      console.log("totalmem: ", totalmem);
      setTotalmem(totalmem);
    })
    .catch(error => {
      console.error("Failed to get totalmem:", error);
    });
  }, []);

  return (
    <>
      <p>os.hostname() = {hostname}</p>
      <p>os.release() = {release}</p>
      {/* <p>os.version() = {version}</p> */}
      <p>os.totalmem() = {totalmem}</p>
      <p>os.cpus().length = {cpus.length}</p>
      <p>os.cpus()[0].model = {cpus[0].model}</p>
      {/* <p>{JSON.stringify(primaryDisplay)}</p>
      <p>{JSON.stringify(allDisplays)}</p> */}
    </>
  )
}

export default App
