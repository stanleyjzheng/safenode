const toBuffer = require('ethereumjs-util').toBuffer
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx');
const { sendTransaction } = require('@wagmi/core');
const { default: axios } = require('axios');
const request = require('request');
require('dotenv').config()

const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

const txs = [

]

const tenderlyUrl = 'https://api.tenderly.co/api/v1/account/'+process.env.TENDERLY_USER+'/project/'+process.env.TENDERLY_PROJECT+'/simulate'

async function submitTransaction(raw_transaction) {
    
}

async function getSafety(db, to, from, tenderlySimulations) {
    // for only highest trusted contracts -- opensea, etc
    var result = await db.get("SELECT * from global_contract_whitelist where address = (?)", to)
    console.log(result)
    if (result != undefined) { 
        return {
            sendTransaction: true
        }
    }

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

async function processTxs(txs) {
    const db = await open({
        filename: './rpc/safenode.sqlite3',
        driver: sqlite3.Database
    }) 

    for (var tx of txs) {

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
            "save": true,
        }

        const resp = await axios.post(tenderlyUrl, tenderlyBody,  {
            'X-Access-Key': process.env.TENDERLY_ACCESS_KEY
        })

        const dangerousEvents = [
            'Transfer',
            'Approval',
            'ApprovalForAll'
        ]

        var outputTransactions = [];

        const events = resp.data['transaction']['transaction_info']['call_trace']['logs']
        for (const event of events) {
            if (dangerousEvents.includes(event['name'])) {
                var tenderlyEvent = {
                    'contract_address': event['raw']['address'],
                    'function_name': event['name'],
                    'from': event['inputs'][0]['value'], // might not always be first, not great to assume
                    'to': event['inputs'][1]['value'],
                    'tokenId': event['inputs'][2]['value'],
                }

                for (const contract of resp.data['contracts']) {
                    if (contract['address'] == tenderlyEvent.contract_address) {
                        tenderlyEvent['token_name'] = contract['token_data']['name']
                        tenderlyEvent['token_symbol'] = contract['token_data']['symbol']
                    }
                    outputTransactions.push(tenderlyEvent)
                }
            }
        }

        db.exec(`
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
            raw_transaction
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        resp.data['transaction']['hash'],
        tx['from'],
        tx['to'],
        tx['value'],
        tx['gas_price'],
        tx['gas'],
        resp.data['transaction']['gas_used'],
        x['error'] ? x['error'] : '',
        x['warning'] ? x['warning'] : '',
        JSON.stringify(outputTransactions),
        tx
        )
    }
}


processTxs(txs).then(() => {
    console.log('done');
}).catch(err => {
    console.log(err);
});
