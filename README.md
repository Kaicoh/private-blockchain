# Private blockchain

One of Udacity Blockchain Developer Nanodegree program.
You can get and create blocks in your private blockchain via http call.

## Framework

Express.js

## Getting Started
### how to install

Run this command and install the dependencies.

```
npm install
```

### how to start

Run this command and start the server on port 8000.

```
npm start
```

## Endpoints
### 1. POST http://localhost:8000/requestValidation
First, register your wallet address to validate following requests.

### Request Body
The request body must be JSON format and have "address" property.

```
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
}
```

### Response
The response looks like as follows. It returns in a JSON format.

```
{
    "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1544451269",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544451269:starRegistry",
    "validationWindow": 300
}
```

### 2. POST http://localhost:8000/message-signature/validate
Using your wallet address and the message you got from the previous response, create signature and submit it to validate your wallet address.

### Request Body
The request body must be JSON format and have "address" and "signature" properties.

```
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "signature": "H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}
```

### Response
The response looks like as follows. It returns in a JSON format.

```
{
    "registerStar": true,
    "status": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "requestTimeStamp": "1544454641",
        "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544454641:starRegistry",
        "validationWindow": 193,
        "messageSignature": true
    }
}
```

Now, you are granted to register a start to the blockchain.

### 3. POST http://localhost:8000/block
Submit your address and star object to register the star.

### Request Body
The request body must be JSON format and have "address" and "star" properties.

```
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "Found star using https://www.google.com/sky/"
    }
}
```

### Response
The response looks like as follows. It returns in a JSON format.

```
{
    "hash": "8098c1d7f44f4513ba1e7e8ba9965e013520e3652e2db5a7d88e51d7b99c3cc8",
    "height": 1,
    "body": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1544455399",
    "previousBlockHash": "639f8e4c4519759f489fc7da607054f50b212b7d8171e7717df244da2f7f2394"
}
```

### 4. GET http://localhost:8000/block/[blockHeight]
You get information about the block of requested block height. You can set any number to *[blockHeight]*. For example, http://localhost:8000/block/10, where '10' is a block height.

### Parameter
- blockHeight: number

### Response
The response looks like as follows. It returns in a JSON format.

```
{
    "hash": "8098c1d7f44f4513ba1e7e8ba9965e013520e3652e2db5a7d88e51d7b99c3cc8",
    "height": 1,
    "body": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1544455399",
    "previousBlockHash": "639f8e4c4519759f489fc7da607054f50b212b7d8171e7717df244da2f7f2394"
}
```

### 5. GET http://localhost:8000/stars/hash:[blockHash]
You get information about the block of requested block hash.

### Parameter
- blockHash: string

### Response
The response looks like as follows. It returns in a JSON format.
```
{
    "hash": "8098c1d7f44f4513ba1e7e8ba9965e013520e3652e2db5a7d88e51d7b99c3cc8",
    "height": 1,
    "body": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1544455399",
    "previousBlockHash": "639f8e4c4519759f489fc7da607054f50b212b7d8171e7717df244da2f7f2394"
}
```

### 6. GET http://localhost:8000/stars/address:[walletAddress]
You get information about the blocks from the passed walletAddress value.

### Parameter
- walletAddress: string

### Response
The response looks like as follows. It returns in a JSON format.
```
[
    {
        "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
        "height": 1,
        "body": {
            "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1532296234",
        "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
    },
    {
        "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
        "height": 2,
        "body": {
            "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
            "star": {
                "ra": "17h 22m 13.1s",
                "dec": "-27° 14' 8.2",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1532330848",
        "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
    }
]
```

## Testing

Run this command.

```
npm test
```
