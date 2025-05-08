const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE;

exports.main = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing id" }) };
  }
  const res = await ddb.send(new GetCommand({ TableName: TABLE, Key: { pk: id } }));
  if (!res.Item) {
    return { statusCode: 404, body: JSON.stringify({ message: "Not found" }) };
  }
  return { statusCode: 200, body: JSON.stringify(res.Item) };
};
