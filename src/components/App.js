import React, { useState, useEffect } from "react";
import allNames from "../data/all_names.json";
import { Container, Row, Col, Button } from "react-bootstrap";
import classes from "../css/App.module.css";

export default function App() {
    const [namePool, setNamePool] = useState(null); // null = not loaded yet
    const [currentName, setCurrentName] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [votes, setVotes] = useState(false);

    // ✅ Load saved votes, namePool, and currentName when app starts
    useEffect(() => {
        const savedVotes = localStorage.getItem("votes");
        const savedPool = localStorage.getItem("namePool");
        const savedCurrent = localStorage.getItem("currentName");

        if (savedVotes) {
            setVotes(JSON.parse(savedVotes));
        }

        if (savedPool) {
            const parsedPool = JSON.parse(savedPool);
            if (parsedPool.length > 0) {
                setNamePool(parsedPool);
            } else {
                setNamePool(allNames);
            }
        } else {
            setNamePool(allNames);
        }

        if (savedCurrent) {
            setCurrentName(JSON.parse(savedCurrent));
        }
    }, []);

    // ✅ If namePool is ready and no currentName loaded, pick one
    useEffect(() => {
        if (namePool && namePool.length > 0 && !currentName) {
            pickRandomName();
        }
    }, [namePool]);

    // ✅ Save votes to localStorage when they change
    useEffect(() => {
        if (votes) {
            localStorage.setItem("votes", JSON.stringify(votes));
        } else {
            localStorage.removeItem("votes");
        }
    }, [votes]);

    // ✅ Save namePool to localStorage when it changes
    useEffect(() => {
        if (namePool) {
            localStorage.setItem("namePool", JSON.stringify(namePool));
        }
    }, [namePool]);

    // ✅ Save currentName to localStorage when it changes
    useEffect(() => {
        if (currentName) {
            localStorage.setItem("currentName", JSON.stringify(currentName));
        } else {
            localStorage.removeItem("currentName");
        }
    }, [currentName]);

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

    const getBackgroundColor = () => {
        if (!currentName) return "";
        return currentName.gender === "Girl"
            ? classes.girlBackground
            : classes.boyBackground;
    };

    const handleClearVotes = () => {
        localStorage.removeItem("votes");
        localStorage.removeItem("namePool");
        localStorage.removeItem("currentName");
        setVotes({});
        setNamePool(allNames);
        setShowResults(false);
        setCurrentName(null);
    };

    const downloadCSV = () => {
        const liked = likedNames.map(n => `"${n.name}","${n.gender}","${n.year}","Liked"`).join("\n");
        const disliked = dislikedNames.map(n => `"${n.name}","${n.gender}","${n.year}","Disliked"`).join("\n");

        const csvHeader = "Name,Gender,Year,Vote\n";
        const csvContent = csvHeader + liked + "\n" + disliked;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "baby_name_votes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const mailResults = () => {
        const liked = likedNames.map(n => `${n.name} (${n.gender}, ${n.year})`).join(", ");
        const disliked = dislikedNames.map(n => `${n.name} (${n.gender}, ${n.year})`).join(", ");

        const subject = encodeURIComponent("My Baby Name Votes");
        const body = encodeURIComponent(`👍 Liked:\n${liked}\n\n👎 Disliked:\n${disliked}`);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };


    return (
        <div>
            <div className={classes.header}>
                <h1 className="text-2xl font-bold mb-4">Baby Names</h1>
                <div className={classes.exportContainer}>
                    <Button variant="success" onClick={downloadCSV} style={{ marginRight: "12px" }}>CSV</Button>
                    <Button variant="info" onClick={mailResults}>Email</Button>
                </div>
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
                        <div className={classes.resultsHeaderContainer}>
                            <h2 className={classes.resultsHeader}>Voting Results</h2>
                        </div>

                        <Row>
                            <Col className={classes.resultsCol}>
                                <Row>
                                    <h4>👍 Liked</h4>
                                </Row>
                                <Row>
                                    <ul>
                                        {likedNames.map((item) => (
                                            <li key={`${item.year}-${item.gender}-${item.name}`}>
                                                {item.name} ({item.gender}, {item.year})
                                            </li>
                                        ))}
                                    </ul>
                                </Row>
                            </Col>
                            <Col className={classes.resultsCol}>
                                <Row>
                                    <h4>👎 Disliked</h4>
                                </Row>
                                <Row>

                                    <ul>
                                        {dislikedNames.map((item) => (
                                            <li key={`${item.year}-${item.gender}-${item.name}`}>
                                                {item.name} ({item.gender}, {item.year})
                                            </li>
                                        ))}
                                    </ul>
                                </Row>
                            </Col>
                        </Row>
                        <Row className={classes.resultsButton}>
                            <Col className={classes.resultsCol}>
                                <Button
                                    variant="secondary"
                                    className="mt-4"
                                    onClick={() => setShowResults(false)}
                                >
                                    Back to Voting
                                </Button>
                            </Col>
                            <Col className={classes.resultsCol}>
                                <Button
                                    variant="danger"
                                    className="mt-4 ms-2"
                                    onClick={handleClearVotes}
                                >
                                    Reset & Start Over
                                </Button>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>
        </div>
    );
}
