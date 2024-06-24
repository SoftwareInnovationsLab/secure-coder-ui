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
  const [argv, setArgv] = useState('');
  const [stdin, setStdin] = useState('');

  const handleSubmitCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exerciseId, code, language, argv, stdin }),
      });
      const data = await response.json();
      setResult(data); // Update results
    } catch (error) {
      console.error('Error submitting code:', error);
      setResult({ error: 'Failed to submit code' }); // Update with error
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
        if (data.argv) {
          setArgv(data.argv)
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
      }
    };

    fetchExercise();
  }, [exerciseId]); // Re-fetch when exerciseId changes

  return (
    <Container>
      <h1>Practice Safety and Security Debugging</h1>
      {exercise ? (
        <>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
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
            <RedExercise code={code} setCode={setCode} argv={argv} setArgv={setArgv} setStdin={setStdin} />
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

function RedExercise({ code, setCode, argv, setArgv, stdin, setStdin }) {
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
      Command line arguments (space delimeted):<br></br><input type="text" value={argv} onChange={(e) => setArgv(e.target.value)} placeholder="Enter command line arguments here..." /><br></br><br></br>
      Standard input:<br></br><input type="text" onChange={(e) => setStdin(e.target.value)} placeholder="Enter standard input here..." /><br></br>
    </>
  );
}

export default Exercise;
