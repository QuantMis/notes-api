const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE;

exports.main = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing id" }) };
  }
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { pk: id } }));
  return { statusCode: 204, body: "" };
};
