import axios from 'axios';
import './App.css';
import React, { useState, useEffect } from 'react';
import stubs from './defaultStubs';
import moment from 'moment';

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    const defaultLanguage = localStorage.getItem('default-language') || 'cpp';
    setLanguage(defaultLanguage);
  }, []);

  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  const setDefaultLanguage = () => {
    localStorage.setItem('default-language', language);
    console.log("Default language set to: ", language);
  };

  const renderTimeDetails = () => {
    if(!jobDetails) return "";
    let result = "";

    let { startedAt, completedAt, submittedAt } = jobDetails;
    submittedAt = moment(submittedAt).toString();
    result += `Submitted at: ${submittedAt}\n`;

    if(!completedAt || !startedAt){
      return result;
    }

    const start = moment(startedAt);
    const end = moment(completedAt);
    const duration = end.diff(start, 'seconds', true);

    result += `Execution time: ${duration}s \n`;

    return result;
  };

  const handleSubmit = async() => {
    const payload = {
      language,
      code
    };
    try{
      setJobId("");
      setOutput("");
      setStatus("");
      setJobDetails(null);
      const { data } = await axios.post('https://online-code-compiler-server.onrender.com/run', payload)
      console.log("data: ",data);
      setJobId(data.jobId);

      let intervalId;

      intervalId = setInterval(async () => {
        const { data: dataRes } = await axios.get(`https://online-code-compiler-server.onrender.com/status`, {params: {id: data.jobId}});

        const { success, job, error } = dataRes;
        console.log("dataRes: ",dataRes);

        if(success){
          const {status: jobStatus, output: jobOutput} = job;
          setStatus(jobStatus);
          setJobDetails(job);
          if(jobStatus === 'pending') return ;
          setOutput(jobOutput);
          clearInterval(intervalId);
        }else {
          setStatus('Error please try again later.');
          console.error(error);
          clearInterval(intervalId);
          setOutput(error);
        }
      },1000);

    } catch ({ response }){
      if(response){
        const errMsg = response.data.error.stderr || response.data.error;
        setOutput(errMsg);
      } else {
        setOutput('Error connecting to server. Please try again later.');
      }
    }
    
    }
  
  return (
    <div className="App">
      <h1>Online Code Compiler</h1>
      
      <div className="controls-section">
        <div className="language-controls">
          <label>Language:</label>
          <select
            value={language}
            onChange={(e) => {
              let response = window.confirm("Changing the language will clear the code. Do you want to continue?");
              if(response){
                setLanguage(e.target.value);
              }
            }}
          >
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="py">Python</option>
          </select>
          <button onClick={setDefaultLanguage}>Set default</button>
        </div>
        <button onClick={handleSubmit}>Run Code</button>
      </div>

      <div className="main-content">
        <div className="editor-section">
          <h2>Code Editor</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
          ></textarea>
        </div>

        <div className="output-section">
          <h2>Output</h2>
          <div className="output-container">
            {status && (
              <>
                <h2>Status</h2>
                <pre className={`status-${status.toLowerCase()}`}>{status}</pre>
              </>
            )}
            {jobId && (
              <>
                <h2>Job ID</h2>
                <pre>{`JobId: ${jobId}`}</pre>
              </>
            )}
            {jobDetails && (
              <>
                <h2>Details</h2>
                <pre>{renderTimeDetails()}</pre>
              </>
            )}
            {output && (
              <>
                <h2>Program Output</h2>
                <pre>{output}</pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
