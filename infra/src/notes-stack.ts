import { Construct } from "constructs";
import { TerraformStack, TerraformOutput } from "cdktf";
import { AwsProvider, dynamodb, iam, lambda, apigatewayv2 } from "@cdktf/provider-aws";
import { ArchiveFile } from "@cdktf/provider-archive";
import path from "path";

export class NotesStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, "aws", {
      region: "ap-southeast-1"
    });

    // DynamoDB table
    const table = new dynamodb.DynamodbTable(this, "notesTable", {
      name: "notes",
      billingMode: "PAY_PER_REQUEST",
      hashKey: "pk",
      attribute: [{ name: "pk", type: "S" }]
    });

    // IAM role for all Lambdas
    const role = new iam.IamRole(this, "lambdaRole", {
      name: "notes-lambda-role",
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Principal: { Service: "lambda.amazonaws.com" },
          Action: "sts:AssumeRole"
        }]
      })
    });

    new iam.IamRolePolicy(this, "lambdaPolicy", {
      role: role.name,
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["dynamodb:*"],
            Resource: [table.arn]
          },
          {
            Effect: "Allow",
            Action: [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ],
            Resource: "arn:aws:logs:*:*:*" 
          }
        ]
      })
    });

    // Helper to build each Lambda
    const createLambda = (id: string, srcDir: string) => {
      const zip = new ArchiveFile(this, `${id}Zip`, {
        type: "zip",
        sourceDir: path.resolve("../functions", srcDir),
        outputPath: path.resolve("./dist", `${id}.zip`)
      });

      return new lambda.LambdaFunction(this, id, {
        functionName: `notes-${srcDir}`,
        runtime: "nodejs20.x",
        handler: "handler.main",
        filename: zip.outputPath,
        sourceCodeHash: zip.outputBase64sha256,
        role: role.arn,
        environment: {
          variables: {
            TABLE: table.name
          }
        }
      });
    };

    const createFn = createLambda("createFn", "create");
    const getFn = createLambda("getFn", "get");
    const listFn = createLambda("listFn", "list");
    const updateFn = createLambda("updateFn", "update");
    const deleteFn = createLambda("deleteFn", "delete");

    // HTTP API
    const httpApi = new apigatewayv2.Apigatewayv2Api(this, "httpApi", {
      name: "notes-api",
      protocolType: "HTTP"
    });

    // default stage
    new apigatewayv2.Apigatewayv2Stage(this, "defaultStage", {
      apiId: httpApi.id,
      name: "$default",
      autoDeploy: true
    });

    // integration + route helper
    const addRoute = (name: string, routeKey: string, fn: lambda.LambdaFunction) => {
      const int = new apigatewayv2.Apigatewayv2Integration(this, `${name}Int`, {
        apiId: httpApi.id,
        integrationType: "AWS_PROXY",
        integrationUri: fn.invokeArn,
        payloadFormatVersion: "2.0"
      });

      new apigatewayv2.Apigatewayv2Route(this, `${name}Route`, {
        apiId: httpApi.id,
        routeKey,
        target: `integrations/${int.id}`
      });
    };

    addRoute("create", "POST /notes", createFn);
    addRoute("list", "GET /notes", listFn);
    addRoute("get", "GET /notes/{id}", getFn);
    addRoute("update", "PUT /notes/{id}", updateFn);
    addRoute("delete", "DELETE /notes/{id}", deleteFn);

    new TerraformOutput(this, "api_url", {
      value: httpApi.apiEndpoint
    });
  }
}
