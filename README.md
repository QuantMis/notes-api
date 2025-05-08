# Notes App – Serverless Demo

A minimal CRUD Notes backend powered by AWS Lambda (Node 20.x), API Gateway HTTP API, and DynamoDB, defined with **CDK for Terraform (CDKTF)**.

## Prerequisites

* Node ≥ 20
* `npm`
* AWS CLI credentials (or AWS SSO + `aws sso login`)
* `cdktf-cli` (`npm i -g cdktf-cli`)

## Setup

```bash
git clone <this‑repo>
cd notes-app
npm install               # installs root dev‑deps and all workspaces

cd infra
npm run synth             # generates Terraform JSON
npm run deploy            # deploys to your AWS account (ap-southeast-1)

# API endpoint is printed after deploy:
API_URL=$(terraform output -raw api_url)

# create a note
curl -X POST "$API_URL/notes"      -H "Content-Type: application/json"      -d '{"id":"1","title":"Hello","content":"world"}'

# list notes
curl "$API_URL/notes"
```

## Clean‑up

```bash
cd infra
npm run destroy
```
