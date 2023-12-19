import React, { useEffect, useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';

import { useForm } from "react-hook-form";

// import "./App.css";

const BASE_URL = "http://localhost:9090";

const fetchSearch = async (formData) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search`,
      {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'multipart/form-data'
        // },
        body: formData
      }
    );

    const data = await response.json();
    let newData = [];
    if (data.data.hits.hits.length > 0) {
        for (let j = 0; j < data.data.hits.hits.length; j++) {
          let h = data.data.hits.hits[j];
          newData.push(h._source);
        }
    }
    return newData;
  } catch(e) {
    console.log(e);
    return [];
  }
  // This assumes the API returns a JSON list of suggestions
}

export default function App() {
    const { register, handleSubmit } = useForm();
    const [searchResult, setSearchResult] = useState([]);

    const handleSearchEvent = (data) => {
        const formData = new FormData();
        formData.append("file", data.file[0]);

        fetchSearch(formData).then(result => {
            if (result) {
                console.log(result);
                setSearchResult(result);
            }
        }).catch(e => {
            console.log(e);
        });
    };

    return (
        <div>
            <div style={{ width: 500, margin: 20 }}>
                <Form onSubmit={handleSubmit(handleSearchEvent)}>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Search Here</Form.Label>
                        <Form.Control type="file" name="file" {...register("file")}/>
                    </Form.Group>
                    <Button variant="primary" type="submit">Search</Button>
                </Form>
            </div>

            {searchResult.length > 0 &&
                <Container>
                    {searchResult.map((r, index) => (
                        <Row key={index}>
                            <Col xs={6} md={4}>
                                <Image src={r.image} thumbnail  />
                            </Col>
                        </Row>
                    ))}
                </Container>}
        </div>
    );
}
