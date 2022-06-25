require('dotenv').config()
const express = require('express');
const cors = require('cors')
const request = require('request');
const toBuffer = require('ethereumjs-util').toBuffer
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx')

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
    if (req.body['method'] == 'eth_sendRawTransaction') {
        console.log(req.body)
        const txData = toBuffer(req.body['params'][0])
        const tx = FeeMarketEIP1559Transaction.fromRlpSerializedTx(txData)
        var tenderlyBody = {
            "network_id": tx.chainId.toString('hex'),
            "from": tx.getSenderAddress().toString('hex'),
            "to": tx.to.toString('hex'),
            "input": tx.data.toString('hex'),
            "gas": tx.gasLimit.toNumber(),
            "gas_price": tx.maxFeePerGas.toNumber() + tx.maxPriorityFeePerGas.toNumber(),
            "value": tx.value.toNumber(),
        }

        // do somethin here with tenderly
        console.log(tenderlyBody)
    }
    else {
        passthroughRPC(req, res)
    }
})

app.listen(process.env.RPC_PORT);
