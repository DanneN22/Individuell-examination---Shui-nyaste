// backend/handler.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.TABLE_NAME;

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // för enkel testning från S3
  },
  body: JSON.stringify(body),
});

exports.router = async (event) => {
  const method = event.httpMethod;
  const path = event.path;
  try {
    if (method === 'GET' && event.pathParameters && event.pathParameters.username) {
      // GET /messages/user/{username}
      const username = decodeURIComponent(event.pathParameters.username);
      const resp = await dynamo.query({
        TableName: TABLE,
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :u',
        ExpressionAttributeValues: { ':u': username },
      }).promise();
      // sort by createdAt desc
      resp.Items.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
      return json(200, resp.Items);
    }
    if (method === 'GET') {
      // GET /messages
      const resp = await dynamo.scan({ TableName: TABLE }).promise();
      resp.Items.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
      return json(200, resp.Items);
    }
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.username || !body.text) {
        return json(400, { message: 'username and text required' });
      }
      const item = {
        id: uuidv4(),
        username: body.username,
        text: body.text,
        createdAt: new Date().toISOString(),
      };
      await dynamo.put({ TableName: TABLE, Item: item }).promise();
      return json(201, item);
    }
    if (method === 'PUT' && event.pathParameters && event.pathParameters.id) {
      const id = event.pathParameters.id;
      const body = JSON.parse(event.body || '{}');
      if (!body.text) return json(400, { message: 'text required' });
      // uppdatera text (enkel)
      await dynamo.update({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: 'SET #t = :t',
        ExpressionAttributeNames: { '#t': 'text' },
        ExpressionAttributeValues: { ':t': body.text },
      }).promise();
      return json(200, { id, text: body.text });
    }
    if (method === 'DELETE' && event.pathParameters && event.pathParameters.id) {
      const id = event.pathParameters.id;
      await dynamo.delete({ TableName: TABLE, Key: { id } }).promise();
      return json(204, null);
    }
    return json(404, { message: 'not found' });
  } catch (err) {
    console.error(err);
    return json(500, { message: 'internal server error', error: err.message });
  }
};
