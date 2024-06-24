import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Col, Container, ListGroup, Row } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

function ExerciseList() {
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/exercises`);
                const data = await response.json();
                setExercises(data);
                console.error(response);
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };

        fetchExercises();
    }, []);

    return (
        <Container>
            <h1>Practice Safety and Security Debugging</h1>
            <Row>
                <Col>
                    <p>
                        Welcome to TBD.
                        This site is designed to provide you with small debugging exercises.
                        Please select an exercise from the list below.
                        Each exercise is categorized according to a common weakness enumeration (CWE).
                    </p>
                </Col>
                <Col></Col>
            </Row>
            <h3>Available Exercises</h3>
            {Object.entries(exercises).map(([category, exercises]) => (
                <>
                    <Row>
                        <Col><h4>{category}</h4></Col>
                    </Row>
                    <Row>
                        <Col>
                            <ListGroup>
                                {exercises.filter(exercise => exercise.type === 'resource').map((exercise) => (
                                    <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                        <div className="ms-2 me-auto">
                                            <Link to={exercise.url} target="_blank">{exercise.title}</Link>
                                        </div>
                                        <Badge bg="success" pill>resource</Badge>
                                    </ListGroup.Item>
                                ))}
                                {exercises.filter(exercise => exercise.type === 'offensive').map((exercise) => (
                                    <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                        <div className="ms-2 me-auto">
                                            <Link to={`/exercise/${exercise.id}`}>{exercise.title}</Link>
                                        </div>
                                        <Badge bg="danger" pill>offensive</Badge>
                                    </ListGroup.Item>
                                ))}
                                {exercises.filter(exercise => exercise.type === 'defensive').map((exercise) => (
                                    <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                        <div className="ms-2 me-auto">
                                            <Link to={`/exercise/${exercise.id}`}>{exercise.title}</Link>
                                        </div>
                                        <Badge bg="primary" pill>defensive</Badge>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>
                        <Col></Col>
                    </Row>
                    <br></br>
                </>
            ))}
        </Container >
    );
}

export default ExerciseList;
