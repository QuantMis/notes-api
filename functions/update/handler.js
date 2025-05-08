const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE;

exports.main = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing id" }) };
  }
  const body = JSON.parse(event.body || "{}");
  const updateExpr = [];
  const exprAttrValues = {};
  for (const [k, v] of Object.entries(body)) {
    updateExpr.push(`#${k} = :${k}`);
    exprAttrValues[`:${k}`] = v;
  }
  const res = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { pk: id },
    UpdateExpression: `SET ${updateExpr.join(", ")}`,
    ExpressionAttributeNames: Object.fromEntries(Object.keys(body).map(k => [`#${k}`, k])),
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: "ALL_NEW"
  }));
  return { statusCode: 200, body: JSON.stringify(res.Attributes) };
};
