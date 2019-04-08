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
### 1. GET *http://localhost:8000/block/[blockHeight]*

- http method: GET
- url: http://localhost:8000/block/[blockHeight]

You get information about the block of requested block height. You can set any number to *[blockHeight]*. For example, [http://localhost:8000/block/10](http://localhost:8000/block/10), where '10' is a block height.

#### Response
When success, the block object will return in JSON format with http status code 200.

```
{
    "hash": "b599b273bab96ddcd9ed48f4ac82d63969b7703b739dedad8e18a4209c2d9c70",
    "height": 10,
    "data": "This is the Block #10",
    "time": "1554763745",
    "previousBlockHash": "51cbd35f3da8c014ff5b90de1a468ffd519c3a9d827e11347629360e355abeeb"
}
```

When not found a block with requested height, the text "Not Found" will return with http status code 404.

### 2. POST *http://localhost:8000/block*

- http method: POST
- url: http://localhost:8000/block

You create a block with any text data in the block body. You have to add a data payload in the request body, otherwise the request will fail.

### Request Body
Data payload must be JSON format and have "body" property.
```
{
    "body": "The body property is required!"
}
```

### Response
When success, a new block will create and the created block data will return with http status code 201.
```
{
    "hash": "5e64081f60712eadef29dfddcb859ee4a47b2a12c680b211f0eecf705dd34bf5",
    "height": 11,
    "data": "The body property is required!",
    "time": "1554763788",
    "previousBlockHash": "b599b273bab96ddcd9ed48f4ac82d63969b7703b739dedad8e18a4209c2d9c70"
}
```

When you request with any content on the payload, a new block won't be created and will return the message "data payload required" with http status code 400.

## Testing

Run this command.

```
npm test
```
