const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { main } = require("../handler");

const ddbMock = mockClient(DynamoDBClient);

beforeEach(() => ddbMock.reset());

test("creates item successfully", async () => {
  ddbMock.on(PutCommand).resolves({});
  const res = await main({ body: JSON.stringify({ id: "1", title: "test" }) });
  expect(res.statusCode).toBe(201);
  expect(JSON.parse(res.body).pk).toBe("1");
  expect(ddbMock.commandCalls(PutCommand).length).toBe(1);
});
