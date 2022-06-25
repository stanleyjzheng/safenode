require('dotenv').config()
const express = require('express');
const cors = require('cors')
const request = require('request');

const app = express();

app.use(express.json());
app.use(cors())

async function passthroughRPC(req, res) {
    request({
        url: process.env.RPC_URL,
        method: 'POST',
        json: req.body
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('result', body)
            res.send(body);
        }
        else {
            console.log(error)
            console.log(response)
            console.log(body)
        }
    })
}

app.post('/', async function (req, res) {
    console.log('call', req.body)
    if req.body['method'] == 'eth_sendRawTransaction'{
        console.log('uhhh do something here')
    }
    else {
        passthroughRPC(req, res)
    }
})

app.listen(process.env.RPC_PORT);
