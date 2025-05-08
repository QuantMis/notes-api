const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE;

exports.main = async () => {
  const res = await ddb.send(new ScanCommand({ TableName: TABLE }));
  return { statusCode: 200, body: JSON.stringify(res.Items || []) };
};
