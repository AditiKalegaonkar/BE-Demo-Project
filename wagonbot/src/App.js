import React, { useState, useEffect } from 'react';
import { Button, Col, Form, FormControl, Row, Spinner, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post('https://localhost:5000/query', { query });
      const answer = response.data.answer;

      const newEntry = { query, answer, timestamp: new Date().toISOString() };

      // Update local state
      setHistory(prev => [newEntry, ...prev]);

      // Save to backend JSON file
      await axios.post('https://localhost:5000/history', newEntry);

      console.log(answer);
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  // Optional: Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('https://localhost:5000/history');
        setHistory(res.data.reverse()); // assuming array of entries
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-dark text-white p-3" style={{ width: '300px', height: '100vh', overflowY: 'auto' }}>
        <h5>History</h5>
        <ListGroup variant="flush">
          {history.map((item, index) => (
            <ListGroup.Item key={index} className="bg-dark text-white border-0">
              <div><strong>Q:</strong> {item.query}</div>
              <div className="text-muted small">{new Date(item.timestamp).toLocaleString()}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        <h1 className="mt-4 text-center">YOUR CAR ASSISTANT!</h1>
        <div className="bg-light border-top fixed-bottom p-3">
          <Form onSubmit={(e) => { e.preventDefault(); handleQuery(); }}>
            <Row className="justify-content-center">
              <Col md={{ span: 10, offset: 1 }}>
                <Row className="align-items-center">
                  <Col xs={12} md={4} className="mb-2 mb-md-0">
                    <Form.Group controlId="formFile" className="mb-0">
                      <Form.Control type="file" accept=".pdf" />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4} className="mb-2 mb-md-0">
                    <FormControl
                      type="text"
                      placeholder="Enter your query here!"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </Col>
                  <Col xs={12} md={2}>
                    <Button type="submit" className="w-100" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-right-circle"></i>}
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default App;