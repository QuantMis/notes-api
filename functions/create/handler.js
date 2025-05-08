const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE;

exports.main = async (event) => {
  const body = JSON.parse(event.body || "{}");
  if (!body.id) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing id" }) };
  }
  const item = { pk: body.id, ...body };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return { statusCode: 201, body: JSON.stringify(item) };
};
