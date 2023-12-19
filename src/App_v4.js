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
  withAsync
} from 'react-bootstrap-typeahead';

import { v4 as uuidv4 } from 'uuid';

import "./App.css";

const AsyncTypeahead = withAsync(Typeahead);

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
          h.id = uuidv4();
          newData.push(h);
        }
      }
    }

    // remove duplicate result from multi search
    let seen = {};
    newData = newData.filter(v => seen.hasOwnProperty(v.text) ? false : (seen[v.text] = true)).sort((a, b) => a.score - b.score);
    return newData;
  } catch(e) {
    console.log(e);
    return [];
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
    return [];
  }
  // This assumes the API returns a JSON list of suggestions
}

export default function App() {
  const [suggestions, setSuggestions] = useState([]);
  const [emptySuggestion, setEmptySuggestion] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [popularSearch, setPopularSearch] = useState({});

  const handleSearchEvent = (query) => {
    fetchSearch(query).then(result => {
      setSearchResult(result);
    }).catch(e => {
      console.log(e);
    });
  };

  // disable filtering
  const filterBy = () => true;

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: 500, margin: 20 }}>
        
        <Form.Group>
            <Form.Label>Search Here</Form.Label>
            <AsyncTypeahead
              filterBy={filterBy}
              id="basic-typeahead-single"
              isLoading={emptySuggestion}
              labelKey="text"
              onSearch={s => {
                setEmptySuggestion(true);
                fetchSuggestionsMulti(s).then(suggestionsData => {
                  setSuggestions(suggestionsData);
                  setEmptySuggestion(false);
                }).catch(e => {
                  console.log(e);
                });
              }}

              onChange={s => {
                if (s.length > 0) {
                  const query = s[0].text;
                  if (!popularSearch.hasOwnProperty(query)) {
                    popularSearch[query] = 1;
                  } else {
                    popularSearch[query]++;
                  }
                  setPopularSearch({
                    ...popularSearch
                  });

                  handleSearchEvent(query);
                }
              }}

              options={suggestions}
              
              renderMenuItemChildren={(option, props, index) => { 
                return (<span key={index}>{HTMLReactParser(option.highlighted)}</span>)}
              }

              onFocus={e => {
                console.log('on focus');
                if (Object.keys(popularSearch).length > 0) {
                  const newPopularSearchDatas = Object.keys(popularSearch).sort((a, b) => popularSearch[b] - popularSearch[a]).map(v => {
                    return {'text': v, 'highlighted': v};
                  });
                  
                  console.log(newPopularSearchDatas);
                  
                  setSuggestions(newPopularSearchDatas);
                  console.log(suggestions);
                }
              }}

              onBlur={() => {
                setSuggestions([]);
              }}

              placeholder="search"
              maxResults={10}
              minLength={3}
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
