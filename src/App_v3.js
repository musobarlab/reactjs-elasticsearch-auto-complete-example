import React, { useEffect, useState } from "react";
import HTMLReactParser from "html-react-parser";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import {
  Typeahead,
  Highlighter,
  Menu,
  MenuItem,
} from 'react-bootstrap-typeahead';

import "./App.css";

const BASE_URL = "http://localhost:9200";

const fetchSuggestionsMulti = async (query) => {
  const payload = `{}\r\n{\"suggest\":{\"text\":\"${query}\",\"did_you_mean\":{\"phrase\":{\"field\":\"productName.suggest\",\"size\":5,\"confidence\":0.0,\"max_errors\":2,\"collate\":{\"query\":{\"source\":{\"match\":{\"{{field_name}}\":{\"query\":\"{{suggestion}}\",\"fuzziness\":\"2\",\"operator\":\"and\"}}}},\"params\":{\"field_name\":\"productName\"},\"prune\":true},\"highlight\":{\"pre_tag\":\"<strong style='color:red;'>\",\"post_tag\":\"</strong>\"}}}}}\r\n{}\r\n{\"suggest\":{\"text\":\"${query}\",\"did_you_mean\":{\"phrase\":{\"field\":\"productSpecification.suggest\",\"size\":5,\"confidence\":0.0,\"max_errors\":2,\"collate\":{\"query\":{\"source\":{\"match\":{\"{{field_name}}\":{\"query\":\"{{suggestion}}\",\"fuzziness\":\"2\",\"operator\":\"and\"}}}},\"params\":{\"field_name\":\"productSpecification\"},\"prune\":true},\"highlight\":{\"pre_tag\":\"<strong style='color:red;'>\",\"post_tag\":\"</strong>\"}}}}}\r\n{}\r\n{\"suggest\":{\"text\":\"${query}\",\"did_you_mean\":{\"phrase\":{\"field\":\"aboutProduct.suggest\",\"size\":5,\"confidence\":0.0,\"max_errors\":2,\"collate\":{\"query\":{\"source\":{\"match\":{\"{{field_name}}\":{\"query\":\"{{suggestion}}\",\"fuzziness\":\"2\",\"operator\":\"and\"}}}},\"params\":{\"field_name\":\"aboutProduct\"},\"prune\":true},\"highlight\":{\"pre_tag\":\"<strong style='color:red;'>\",\"post_tag\":\"</strong>\"}}}}}\r\n{}\r\n{\"suggest\":{\"text\":\"${query}\",\"did_you_mean\":{\"phrase\":{\"field\":\"categories.suggest\",\"size\":5,\"confidence\":0.0,\"max_errors\":2,\"collate\":{\"query\":{\"source\":{\"match\":{\"{{field_name}}\":{\"query\":\"{{suggestion}}\",\"fuzziness\":\"2\",\"operator\":\"and\"}}}},\"params\":{\"field_name\":\"categories\"},\"prune\":true},\"highlight\":{\"pre_tag\":\"<strong style='color:red;'>\",\"post_tag\":\"</strong>\"}}}}}\r\n`;

  try {
    const response = await fetch(
      `${BASE_URL}/products/_msearch`,
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
  const payload = `{}\r\n{\"query\":{\"bool\":{\"should\":[{\"match\":{\"productName\":\"${query}\"}},{\"fuzzy\":{\"productName\":{\"value\":\"${query}\",\"fuzziness\":2}}}]}}}\r\n{}\r\n{\"query\":{\"bool\":{\"should\":[{\"match\":{\"aboutProduct\":\"${query}\"}},{\"fuzzy\":{\"aboutProduct\":{\"value\":\"${query}\",\"fuzziness\":2}}}]}}}\r\n{}\r\n{\"query\":{\"bool\":{\"should\":[{\"match\":{\"productSpecification\":\"${query}\"}},{\"fuzzy\":{\"productSpecification\":{\"value\":\"${query}\",\"fuzziness\":2}}}]}}}\r\n{}\r\n{\"query\":{\"bool\":{\"should\":[{\"match\":{\"categories\":\"${query}\"}},{\"fuzzy\":{\"categories\":{\"value\":\"${query}\",\"fuzziness\":2}}}]}}}\r\n`;
  try {
    const response = await fetch(
      `${BASE_URL}/products/_msearch`,
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
  const [searchResult, setSearchResult] = useState([]);


  let debounceInputValueTimeout;
  
  useEffect(() => {
    if (!emptySuggestion) {
      // Debouncing User Input
      // This reduces the number of requests made and offers a more efficient experience.
      clearTimeout(debounceInputValueTimeout);
      debounceInputValueTimeout = setTimeout(() => {
        fetchSuggestionsMulti(inputValue).then(suggestionsData => {
          console.log(suggestionsData)
          setSuggestions(suggestionsData);
        }).catch(e => {
          console.log(e);
        });
      }, 1500);
      
    }
    
  }, [inputValue, emptySuggestion, debounceInputValueTimeout]);

  const handleSearchEvent = (query) => {
    fetchSearch(query).then(result => {
      setSearchResult(result);
    }).catch(e => {
      console.log(e);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: 500, margin: 20 }}>
        
        <Form.Group>
            <Form.Label>Search Here</Form.Label>
            <Typeahead
              id="basic-typeahead-single"
              labelKey={op => `${HTMLReactParser(op.highlighted)}`}
              onInputChange={(text, e) => { 
                console.log(text);
                setInputValue(text);
                setEmptySuggestion(false);
              }}
              onChange={s => {
                if (s.length > 0) {
                  handleSearchEvent(s[0].text);
                }
              }}
              options={suggestions}
              placeholder="search"
            />
        </Form.Group>

        {searchResult.length > 0 &&
          <ListGroup>
            {searchResult.map((r, index) => (
                <ListGroup.Item variant={index%2 == 0 ? "success" : "primary"} key={index}>
                    <p>{r.productName}</p>
                    <a href={r.productUrl} target="blank">{r.productUrl}</a>
                </ListGroup.Item>
                // Render each result as a list item
            ))}
        </ListGroup>}
        </div>

      </header>
    </div>
  );
}
