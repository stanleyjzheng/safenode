const toBuffer = require('ethereumjs-util').toBuffer
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx');
const request = require('request');
require('dotenv').config()

const txs = [

]

const tenderlyUrl = 'https://api.tenderly.co/api/v1/account/'+process.env.TENDERLY_USER+'/project/'+process.env.TENDERLY_PROJECT+'/simulate'

console.log(tenderlyUrl)

async function processTxs(txs) {
    for (var tx of txs) {

        var txData = toBuffer(tx)
        var tx = FeeMarketEIP1559Transaction.fromRlpSerializedTx(txData)
        var tenderlyBody = {
            "network_id": parseInt(tx.chainId.toString(10)),
            "from": tx.getSenderAddress().toString('hex'),
            "to": tx.to.toString('hex'),
            "input": tx.data.toString('hex'),
            "gas": parseInt(tx.gasLimit.toString(10)),
            "gas_price": tx.maxFeePerGas.add(tx.maxPriorityFeePerGas).toString(10),
            "value": parseInt(tx.value.toString(10)), // has a tendency to overflow so we use string
            "save": true,
        }

        request({
            url: tenderlyUrl,
            method: 'POST',
            json: tenderlyBody,
            headers: {
                'X-Access-Key': process.env.TENDERLY_ACCESS_KEY
            }
        }, function (error, response, body) {
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
                        var tx = {
                            'contract_address': event['raw']['address'],
                            'function_name': event['name'],
                            'from': event['inputs'][0]['value'], // might not always be first, not great to assume
                            'to': event['inputs'][1]['value'],
                            'tokenId': event['inputs'][2]['value'],
                        }

                        for (const contract of body['contracts']) {
                            if (contract['address'] == tx.contract_address) {
                                tx['token_name'] = contract['token_data']['name']
                                tx['token_symbol'] = contract['token_data']['symbol']
                            }
                            outputTransactions.push(tx)
                        }
                    }
                    console.log(outputTransactions)
                }
            }
            else {
                console.log(error)
                console.log(response)
                console.log(body)
            }
        })
    }
}


processTxs(txs).then(() => {
    console.log('done');
}).catch(err => {
    console.log(err);
});
