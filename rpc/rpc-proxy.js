require('dotenv').config()
const express = require('express');
const cors = require('cors')
const request = require('request');
const toBuffer = require('ethereumjs-util').toBuffer
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3').verbose()
const { default: axios } = require('axios');

const app = express();

app.use(express.json());
app.use(cors())

async function submitRawSignature(sig) {
    const response = await axios.post(
        process.env.RPC_URL,
        JSON.stringify({
            'jsonrpc': '2.0',
            'method': 'eth_sendRawTransaction',
            'params': [sig],
            'id': getRandomInt(10000000)
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

async function addNewAddressWhitelist(addr, db) {
    const response = await axios.get('https://api.covalenthq.com/v1/1/address/' + addr + '/transactions_v2/', {
        params: {
            'key': 'ckey_37944686355f41e7b522836a17b'
        }
    });
    addrs = new Set()
    console.log(response)
    console.log(response.data.items)
    for (var transaction of response.data.items) {
        set.add(transaction.too_address)
    }
    for (var address of addrs) {
        db.run("INSERT INTO individual_recipient_whitelist (sender_address, recipient_address) VALUES (?, ?)", [addr, address])
    }
}

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

async function getSafety(db, to, from, tenderlySimulations) {
    // for only highest trusted contracts -- opensea, etc
    var result = await db.get("SELECT * from global_contract_whitelist where address = (?)", to)
    if (result != undefined) { 
        return {
            sendTransaction: true
        }
    }

    // add individual whitelist if they are new user
    var result = await db.get("SELECT * from individual_recipient_whitelist where sender_address = (?) ", from)
    // if (result == undefined) {
    //     addNewAddressWhitelist(from, db)
    // }
    // pause this for now because i'm on a new address with no outgoing transactions

    // if it is just an eth transfer, no erc721/20
    if (tenderlySimulations.length == 0) { 
        var individualWhitelistResult = await db.get("SELECT * from individual_recipient_whitelist WHERE recipient_address = (?) AND sender_address = (?)", to, from)
        var globalBlacklistResult = await db.get("SELECT * from global_recipient_blacklist where sender_address = (?)", to)

        if (individualWhitelistResult != undefined) { 
            return {
                sendTransaction: true
            }
        }
        else if (globalBlacklistResult != undefined) {
            return {
                sendTransaction: false,
                error: 'Blacklisted address, put some reason here from the database'
            }
        }
        else {
            return {
                sendTransaction: false,
                warning: 'New address; not blacklisted nor whitelisted. Send transaction to whitelist.'
            }
        }
    }
    else {
        var globalWhitelistResult = await db.get("SELECT * from global_contract_whitelist where address = (?)", to)
        if (globalWhitelistResult != undefined) {
            return {
                sendTransaction: true
            }
        }
        for (var simulation of tenderlySimulations) {
            var individualWhitelistResult = await db.get("SELECT * from individual_recipient_whitelist WHERE recipient_address = (?) AND sender_address = (?)", simulation.to, simulation.from)
            var globalBlacklistResult = await db.get("SELECT * from global_recipient_blacklist where address = (?)", simulation.to)
            if (individualWhitelistResult != undefined) {
                return {
                    sendTransaction: true
                }
            }
            else if (globalBlacklistResult != undefined) {
                return {
                    sendTransaction: false,
                    error: 'Blacklisted address, put some reason here from the database'
                }
            }
            else {
                return {
                    sendTransaction: false,
                    warning: 'New address; not blacklisted nor whitelisted. Send transaction to whitelist.'
                }
            }
        }
    }
}

async function processTxs(tx) {
    const db = await open({
        filename: './rpc/safenode.sqlite3',
        driver: sqlite3.Database
    })

    var txData = toBuffer(tx)
    var deserializedTx = FeeMarketEIP1559Transaction.fromRlpSerializedTx(txData)
    var tenderlyBody = {
        "network_id": parseInt(deserializedTx.chainId.toString(10)),
        "from": deserializedTx.getSenderAddress().toString('hex'),
        "to": deserializedTx.to.toString('hex'),
        "input": deserializedTx.data.toString('hex'),
        "gas": parseInt(deserializedTx.gasLimit.toString(10)),
        "gas_price": deserializedTx.maxFeePerGas.add(deserializedTx.maxPriorityFeePerGas).toString(10),
        "value": parseInt(deserializedTx.value.toString(10)), // has a tendency to overflow so we use string
    }
    const tenderlyUrl = 'https://api.tenderly.co/api/v1/account/' + process.env.TENDERLY_USER + '/project/' + process.env.TENDERLY_PROJECT + '/simulate'

    request({
        url: tenderlyUrl,
        method: 'POST',
        json: tenderlyBody,
        headers: {
            'X-Access-Key': process.env.TENDERLY_ACCESS_KEY
        }
    }, async function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const dangerousEvents = [
                'Transfer',
                'Approval',
                'ApprovalForAll'
            ]
            
            var outputTransactions = [];
            
            const events = body['transaction']['transaction_info']['call_trace']['logs']
            for (const event of events) {
                if (dangerousEvents.includes(event['name'])) {
                    var tenderlyEvent = {
                        'contract_address': event['raw']['address'],
                        'function_name': event['name'],
                        'from': event['inputs'][0]['value'], // might not always be first, not great to assume
                        'to': event['inputs'][1]['value'],
                        'tokenId': event['inputs'][2]['value'],
                    }
                    for (const contract of body['contracts']) {
                        if (contract['address'] == tenderlyEvent.contract_address) {
                            tenderlyEvent['token_name'] = contract['token_data']['name']
                            tenderlyEvent['token_symbol'] = contract['token_data']['symbol']
                        }
                    }
                    outputTransactions.push(tenderlyEvent)
                }
            }
            var x = await getSafety(db, tenderlyBody.to, tenderlyBody.from, outputTransactions)
            if (x.sendTransaction) {
                submitRawSignature(tx)
            }
            else {
                params = [
                    body['transaction']['hash'],
                    tenderlyBody['from'],
                    tenderlyBody['to'],
                    tenderlyBody['value'].toString(),
                    parseInt(tenderlyBody['gas_price']),
                    tenderlyBody['gas'],
                    body['transaction']['gas_used'],
                    x['error'] ? x['error'] : '',
                    x['warning'] ? x['warning'] : '',
                    JSON.stringify(outputTransactions),
                    tx,
                    0
                ]

                await db.all(`
                INSERT INTO transactions (
                    transaction_hash,
                    from_address,
                    to_address,
                    value,
                    gas_price,
                    gas_limit,
                    gas_used,
                    errors,
                    warnings,
                    simulation,
                    raw_transaction,
                    world_id
                ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                params 
                )
                db.close()
            }
        
            console.log(params)
        }
        else {
            console.log(error)
            console.log(response)
            console.log(body)
        }
    })
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

app.post('/', async function (req, res) {
    console.log('call', req.body)
    if (req.body['method'] == 'eth_sendRawTransaction') {
        console.log(req.body)
        processTxs(req.body['params'][0])
    }
    else if (req.body['method'] == 'eth_bypassSendRawTransaction') {
        submitRawSignature(req.body['params'][0])
    }
    else {
        passthroughRPC(req, res)
    }
})

app.listen(process.env.RPC_PORT);
