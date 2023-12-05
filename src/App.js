import React, { useEffect, useState } from "react";
import HTMLReactParser from "html-react-parser";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import "./App.css";

const BASE_URL = "https://cf2f-2001-448a-4084-115c-fdd2-e233-6ea8-2e46.ngrok-free.app";

const fetchSuggestions = async (query) => {
  const payload = {
    "suggest": {
      "text": query,
      "did_you_mean": {
        "phrase": {
          "field": "character.suggest",
          "size": 3,
          "confidence": 0.0,
          "max_errors":2,
          "collate": {
            "query": { 
              "source" : {
                "match": {
                  "{{field_name}}": {
                    "query": "{{suggestion}}",
                    "fuzziness": "1",
                    "operator": "and"
                  }
                }
              }
            },
            "params": {"field_name" : "character"}, 
            "prune" :true
          },
          "highlight": {
            "pre_tag": "<strong>",
            "post_tag": "</strong>"
          }
        }
      }
    }
  };

  try {
    const response = await fetch(
      `${BASE_URL}/game-of-thrones,harry-potter/_search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ZWxhc3RpYzpjaGFuZ2VtZQ=='
        },
        body: JSON.stringify(payload)
      }
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch(e) {
    console.log(e);
    return {};
  }
  // This assumes the API returns a JSON list of suggestions
}

const fetchSuggestionsMulti = async (query) => {
  const payload = `{}\r\n{\"suggest\":{\"text\":\"${query}\",\"did_you_mean\":{\"phrase\":{\"field\":\"character.suggest\",\"size\":5,\"confidence\":0.0,\"max_errors\":2,\"collate\":{\"query\":{\"source\":{\"match\":{\"{{field_name}}\":{\"query\":\"{{suggestion}}\",\"fuzziness\":\"2\",\"operator\":\"and\"}}}},\"params\":{\"field_name\":\"character\"},\"prune\":true},\"highlight\":{\"pre_tag\":\"<strong>\",\"post_tag\":\"</strong>\"}}}}}\r\n{}\r\n{\"suggest\":{\"text\":\"${query}\",\"did_you_mean\":{\"phrase\":{\"field\":\"quote.suggest\",\"size\":5,\"confidence\":0.0,\"max_errors\":2,\"collate\":{\"query\":{\"source\":{\"match\":{\"{{field_name}}\":{\"query\":\"{{suggestion}}\",\"fuzziness\":\"2\",\"operator\":\"and\"}}}},\"params\":{\"field_name\":\"quote\"},\"prune\":true},\"highlight\":{\"pre_tag\":\"<strong>\",\"post_tag\":\"</strong>\"}}}}}\r\n{}\r\n{\"suggest\":{\"text\":\"${query}\",\"did_you_mean\":{\"phrase\":{\"field\":\"description.suggest\",\"size\":5,\"confidence\":0.0,\"max_errors\":2,\"collate\":{\"query\":{\"source\":{\"match\":{\"{{field_name}}\":{\"query\":\"{{suggestion}}\",\"fuzziness\":\"2\",\"operator\":\"and\"}}}},\"params\":{\"field_name\":\"description\"},\"prune\":true},\"highlight\":{\"pre_tag\":\"<strong>\",\"post_tag\":\"</strong>\"}}}}}\r\n{}\r\n{\"suggest\":{\"text\":\"${query}\",\"did_you_mean\":{\"phrase\":{\"field\":\"tags.suggest\",\"size\":5,\"confidence\":0.0,\"max_errors\":2,\"collate\":{\"query\":{\"source\":{\"match\":{\"{{field_name}}\":{\"query\":\"{{suggestion}}\",\"fuzziness\":\"2\",\"operator\":\"and\"}}}},\"params\":{\"field_name\":\"tags\"},\"prune\":true},\"highlight\":{\"pre_tag\":\"<strong>\",\"post_tag\":\"</strong>\"}}}}}\r\n`;

  try {
    const response = await fetch(
      `${BASE_URL}/game-of-thrones,harry-potter/_msearch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Authorization': 'Basic ZWxhc3RpYzpjaGFuZ2VtZQ=='
        },
        body: payload
      }
    );
    const data = await response.json();
      console.log(data);
    let newData = [];
    for (let i = 0; i < data.responses.length; i++) {
      const r = data.responses[i];
      if (r._shards.failed > 0) {
        continue
      }

      // suggest.did_you_mean[0].options
      if (r.suggest.did_you_mean[0].options.length > 0) {
        for (let j = 0; j < r.suggest.did_you_mean[0].options.length; j++) {
          let h = r.suggest.did_you_mean[0].options[j];
          newData.push(h);
        }
      }
    }
    return newData;
  } catch(e) {
    console.log(e);
    return {};
  }
  // This assumes the API returns a JSON list of suggestions
}

const fetchSearch = async (query) => {
  const payload = `{}\r\n{\"query\":{\"bool\":{\"should\":[{\"match\":{\"character\":\"${query}\"}},{\"fuzzy\":{\"character\":{\"value\":\"${query}\",\"fuzziness\":2}}}]}}}\r\n{}\r\n{\"query\":{\"bool\":{\"should\":[{\"match\":{\"quote\":\"${query}\"}},{\"fuzzy\":{\"quote\":{\"value\":\"${query}\",\"fuzziness\":2}}}]}}}\r\n{}\r\n{\"query\":{\"bool\":{\"should\":[{\"match\":{\"description\":\"${query}\"}},{\"fuzzy\":{\"description\":{\"value\":\"${query}\",\"fuzziness\":2}}}]}}}\r\n{}\r\n{\"query\":{\"bool\":{\"should\":[{\"match\":{\"tags\":\"${query}\"}},{\"fuzzy\":{\"tags\":{\"value\":\"${query}\",\"fuzziness\":2}}}]}}}\r\n`;
  try {
    const response = await fetch(
      `${BASE_URL}/game-of-thrones,harry-potter/_msearch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Authorization': 'Basic ZWxhc3RpYzpjaGFuZ2VtZQ=='
        },
        body: payload
      }
    );
    const data = await response.json();

    let newData = [];
    for (let i = 0; i < data.responses.length; i++) {
      const r = data.responses[i];
      if (r.hits.hits.length > 0) {
        for (let j = 0; j < r.hits.hits.length; j++) {
          let h = r.hits.hits[j];
          newData.push(h._source);
        }
      }
    }
    return newData;
  } catch(e) {
    console.log(e);
    return {};
  }
  // This assumes the API returns a JSON list of suggestions
}

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [emptySuggestion, setEmptySuggestion] = useState(false);
  const [disableSearchButton, setDisableSearchButton] = useState(true);
  const [searchResult, setSearchResult] = useState([]);

  let debounceInputValueTimeout;
  
  useEffect(() => {
    if (!emptySuggestion) {
      // Debouncing User Input
      // This reduces the number of requests made and offers a more efficient experience.
      clearTimeout(debounceInputValueTimeout);
      debounceInputValueTimeout = setTimeout(() => {
        fetchSuggestionsMulti(inputValue).then(suggestionsData => {
          setSuggestions(suggestionsData);
        }).catch(e => {
          console.log(e);
        });
      }, 1500);
      
    }
    
  }, [inputValue, emptySuggestion, debounceInputValueTimeout]);

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setSuggestions([]);
  };

  const handleSearchButton = () => {
    fetchSearch(inputValue).then(result => {
      setSearchResult(result);
    }).catch(e => {
      console.log(e);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: 200, margin: 20 }}>

          <Form.Text style={{ marginBottom: 20 }}>Type something</Form.Text>
          <Form.Control 
            type="text"
            value={inputValue}
            onChange={e => { 
              setInputValue(e.target.value);
              setEmptySuggestion(false);
            }} 
            style={{ marginBottom: 10 }}
            // Capturing and storing every change in inputValue
          />
          <Button style={{ marginBottom: 20 }}  disabled={disableSearchButton} onClick={handleSearchButton}>Search</Button>

        {suggestions.length > 0 &&
          <ListGroup>
            {suggestions.map((suggestion, index) => (
                <ListGroup.Item variant="light" key={index} onClick={() => { 
                  handleSuggestionClick(suggestion.text);
                  setEmptySuggestion(true);
                  setDisableSearchButton(false);
                  }}>
                    {HTMLReactParser(suggestion.highlighted)}
                </ListGroup.Item>
                // Render each suggestion as a list item
            ))}
        </ListGroup>}

        {searchResult.length > 0 &&
          <ListGroup>
            {searchResult.map((r, index) => (
                <ListGroup.Item variant={index%2 == 0 ? "success" : "primary"} key={index}>
                    {r.character}
                </ListGroup.Item>
                // Render each result as a list item
            ))}
        </ListGroup>}
        </div>

      </header>
    </div>
  );
}
