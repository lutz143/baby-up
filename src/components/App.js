import React, { useState, useEffect } from "react";
import allNames from "../data/all_names.json";
import { Container, Row, Col, Button } from "react-bootstrap";

import classes from "../css/App.module.css"

export default function App() {
    const [namePool, setNamePool] = useState([]);
    const [currentName, setCurrentName] = useState(null);
    const [votes, setVotes] = useState({});
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setNamePool(allNames);
    }, []);

    useEffect(() => {
        if (namePool.length > 0 && !currentName) {
            pickRandomName();
        }
    }, [namePool]);

    const pickRandomName = () => {
        const randomIndex = Math.floor(Math.random() * namePool.length);
        const randomName = namePool[randomIndex];
        setCurrentName(randomName);

        const updatedPool = [...namePool];
        updatedPool.splice(randomIndex, 1);
        setNamePool(updatedPool);
    };

    const handleVote = (voteType) => {
        const key = `${currentName.year}-${currentName.gender}-${currentName.name}`;
        setVotes((prev) => ({
            ...prev,
            [key]: { ...currentName, vote: voteType },
        }));

        if (namePool.length > 0) {
            pickRandomName();
        } else {
            setCurrentName(null);
        }
    };

    const likedNames = Object.values(votes).filter((v) => v.vote === "up");
    const dislikedNames = Object.values(votes).filter((v) => v.vote === "down");

    // Determine background color class
    const getBackgroundColor = () => {
        if (!currentName) return "";
        return currentName.gender === "Girl" ? classes.girlBackground : classes.boyBackground;
    };


    return (
        <div>
            <div className={classes.header}>
                <h1 className="text-2xl font-bold mb-4">Baby Names</h1>
            </div>
            <Container>
                {!showResults ? (
                    <>
                        <div>
                            {currentName ? (
                                <div className={`${getBackgroundColor()}`}>
                                    <Row className={classes.rowContainer}>
                                        <strong>{currentName.name} Lutz</strong>
                                    </Row>
                                    <Row className={classes.rowColContainer}>
                                        <Col>
                                            <div className={classes.flexContainer}>
                                                {currentName.gender}, {currentName.year}
                                            </div>
                                        </Col>
                                        {/* <Col>
                                    <div className={classes.flexContainer}>
                                        {currentName.year}
                                    </div>
                                </Col> */}
                                    </Row>
                                    <Row className={classes.rowColContainer}>
                                        <Col className={classes.appButton}>
                                            <Button
                                                variant="success"
                                                className={classes.appButton}
                                                onClick={() => handleVote("up")}
                                            >
                                                👍
                                            </Button>
                                        </Col>
                                        <Col className={classes.appButton}>
                                            <Button
                                                variant="danger"
                                                className={classes.appButton}
                                                onClick={() => handleVote("down")}
                                            >
                                                👎
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Row className={classes.rowContainer}>
                                        <p className="mt-4 text-gray-600">
                                            Remaining names: {namePool.length}

                                        </p>
                                    </Row>
                                </div>
                            ) : (
                                <p className="text-lg">No more names to vote on! 🎉</p>
                            )}

                        </div>
                        <Row className={classes.rowColContainer}>
                            <Col className={classes.appButton}>
                                <Button
                                    variant="primary"
                                    onClick={() => setShowResults(true)}
                                >
                                    See Results
                                </Button>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <>
                        <h2>Voting Results</h2>
                        <Row>
                            <Col>
                                <h4>👍 Liked</h4>
                                <ul>
                                    {likedNames.map((item) => (
                                        <li key={`${item.year}-${item.gender}-${item.name}`}>
                                            {item.name} ({item.gender}, {item.year})
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                            <Col>
                                <h4>👎 Disliked</h4>
                                <ul>
                                    {dislikedNames.map((item) => (
                                        <li key={`${item.year}-${item.gender}-${item.name}`}>
                                            {item.name} ({item.gender}, {item.year})
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                        </Row>
                        <Button
                            variant="secondary"
                            className="mt-4"
                            onClick={() => setShowResults(false)}
                        >
                            Back to Voting
                        </Button>
                    </>
                )}
            </Container>
        </div>

    );
}
