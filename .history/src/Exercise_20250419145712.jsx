import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CodeMirror from 'codemirror';
import DOMPurify from 'dompurify';
import { Accordion, Alert, Container, Row, Col } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/js/dist/collapse.js'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/clike/clike';

function Exercise() {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [code, setCode] = useState('');
  const language = useState('c');
  const [result, setResult] = useState(null); // Add state to store results
  const [input, setInput] = useState('');

  const handleSubmitCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exerciseId, code, language, input }),
        
      });
      const data = await response.json();
      setResult(data); // Update results
      console.log(JSON.stringify(exercise));
    } catch (error) {
      console.error('Error submitting code:', error);
      setResult({ error: 'Failed to submit code' }); // Update with error
    }
  };

  const handleGetHints = async () => {
  
    try {
      const res = await fetch(
        `${process.env.REACT_APP_AI_TUTOR_URL}/api/security`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(exercise)
        }
      );
      const data = await res.json();
  
      /* 👇 choose ONE of the UX choices: */
  
      // 1. Open the AI‑Tutor UI in a new tab with a session token
      window.open(`${process.env.REACT_APP_AI_TUTOR_UI}/session/${data.session_id}`, "_blank");
  
      // 2. OR show the hints inline (quick modal)
  
    } catch (err) {
      console.error("AI‑Tutor request failed:", err);
      alert("Could not fetch hints from the AI‑Tutor service.");
    }
  };
  

  const renderHints = () => (
    <Accordion alwaysOpen>
      {exercise.hints.map((hint, index) => (
        <Accordion.Item eventKey={index.toString()} key={index}>
          <Accordion.Header>
            Hint {index + 1}
          </Accordion.Header>
          <Accordion.Body>
            <p key={index}>{hint}</p>
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  )

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/exercise/${exerciseId}`);
        const data = await response.json();
        setExercise(data);
        setCode(data.libraryFunction);
        if (data.input) {
          setInput(data.input)
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
      }
    };

    fetchExercise();
  }, [exerciseId]); // Re-fetch when exerciseId changes

  return (
    <Container>
      <h1>{process.env.REACT_APP_TITLE}</h1>
      {exercise ? (
        <>
          <Breadcrumb>
            <Breadcrumb.Item href={process.env.REACT_APP_ROOT}>Home</Breadcrumb.Item>
            <Breadcrumb.Item active>{exercise.category}</Breadcrumb.Item>
            <Breadcrumb.Item active>{exercise.title}</Breadcrumb.Item>
          </Breadcrumb>
          <h1>{exercise.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exercise.description) }} />
          <br></br>
          {exercise.type === 'defensive' && (
            <BlueExercise code={code} setCode={setCode} />
          )}
          {exercise.type === 'offensive' && (
            <RedExercise code={code} setCode={setCode} input={input} setInput={setInput} />
          )}
          <br></br>
          {result && (
            <>
              <div>
                {result.status?.description === 'Accepted'
                  ? <Alert key='success' variant='success'>Success!</Alert>
                  : <Alert key='tryagain' variant='danger'>Try again</Alert>}
                <p>
                  {result.stderr}
                </p>

              </div>
              {result.status?.description === 'Accepted' && (
                <>
                  <h4>Explanation</h4>
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exercise.explanation) }}></div>
                  <br></br>
                </>
              )}
            </>
          )}
          {exercise.hints && renderHints()}
          <br></br>
          <button type="button" class="btn btn-primary" onClick={handleSubmitCode}>Submit</button>
          <button variant="secondary"className="ms-2"onClick={handleGetHints}>Get Hints from AI Tutor</button>

        </>
      ) : (
        <p>Loading exercise...</p>
      )
      }
    </Container>
  );
}


function BlueExercise({ code, setCode }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = CodeMirror.fromTextArea(editorRef.current, {
      value: code,
      mode: 'text/x-csrc',
      theme: 'material',
      lineNumbers: true,
    });

    editor.on('change', (instance, changeObj) => {
      setCode(instance.getValue());
    });

    // Clean up when component unmounts
    return () => {
      editor.toTextArea();
    };
  }, []);

  return (
    <>
      <div>
        <textarea ref={editorRef} defaultValue={code} />
      </div>
    </>
  );
}

function RedExercise({ code, setCode, input, setInput }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = CodeMirror.fromTextArea(editorRef.current, {
      value: code,
      mode: 'text/x-csrc',
      theme: 'material',
      lineNumbers: true,
      readOnly: 'nocursor',
    });

    editor.on('change', (instance, changeObj) => {
      setCode(instance.getValue());
    });

    // Clean up when component unmounts
    return () => {
      editor.toTextArea();
    };
  });

  return (
    <>
      <div>
        <textarea ref={editorRef} defaultValue={code} />
      </div>
      <br></br>
      Input: <br></br><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter inputs here..." /><br></br><br></br>
    </>
  );
}

export default Exercise;
