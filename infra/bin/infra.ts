#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";
import { FrontendPipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

new FrontendStack(app, "FrontendStack", {
  env: {
    account,
    region,
  },
});

const deployPipeline = app.node.tryGetContext("deployPipeline") === "true";

if (deployPipeline) {
  const connectionArn = app.node.tryGetContext("connectionArn");
  const repoString = app.node.tryGetContext("repo") ?? "andrewgilliland/dnd-ui";
  const branch = app.node.tryGetContext("branch") ?? "main";
  const viteApiBaseUrl = app.node.tryGetContext("viteApiBaseUrl");

  if (!connectionArn) {
    throw new Error(
      "Missing required context 'connectionArn'. Example: cdk deploy FrontendPipelineStack -c deployPipeline=true -c connectionArn=arn:aws:codestar-connections:...",
    );
  }

  if (!viteApiBaseUrl) {
    throw new Error(
      "Missing required context 'viteApiBaseUrl'. Example: -c viteApiBaseUrl=https://api.example.com",
    );
  }

  new FrontendPipelineStack(app, "FrontendPipelineStack", {
    env: {
      account,
      region,
    },
    connectionArn,
    repoString,
    branch,
    viteApiBaseUrl,
  });
}
