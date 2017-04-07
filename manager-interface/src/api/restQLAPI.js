// This makes requests to restQL manager API
const request = require('superagent');

const baseUrl = 'http://localhost:4001/run-query';

// Processing request
export function processResult(response) {
    if(response.error !== null) {
        return { error: response.error.message };
    }
    else if(response.body.statusCode === 200) {
        try {
            return JSON.parse(response.body.text);
        }
        catch(e) {
            return { error: 'Invalid JSON Response' };
        }
    }
    else {
        return { error: 'Something got really wrong!'};
    }
}


// Running Queries
export function runQuery(queryString, callback) {
    request
        .post(baseUrl)
        .set('Content-Type', 'text/plain')
        .set('Accept', 'application/json')
        .send(queryString)
        .end((err, body) => {
            return callback({
                error: err,
                body: body
            });
        });
}


