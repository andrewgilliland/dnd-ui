#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";
import { FrontendPipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

const env = { account, region };

const connectionArn = process.env.CONNECTION_ARN ?? "";
const repoString = process.env.REPO_STRING ?? "";

console.log("connectionArn: ", connectionArn);
console.log("repoString: ", repoString);

const devStack = new FrontendStack(app, "DndUiStack-dev", {
  env,
  environment: "dev",
});
const stagingStack = new FrontendStack(app, "DndUiStack-staging", {
  env,
  environment: "staging",
});
const prodStack = new FrontendStack(app, "DndUiStack-prod", {
  env,
  environment: "prod",
});

new FrontendPipelineStack(app, "DndUiPipelineStack-dev", {
  env,
  repoString,
  branch: "dev",
  connectionArn,
  viteApiBaseUrl: process.env.DEV_VITE_API_BASE_URL ?? "",
  environment: "dev",
  frontendStack: devStack,
});

new FrontendPipelineStack(app, "DndUiPipelineStack-staging", {
  env,
  repoString,
  branch: "staging",
  connectionArn,
  viteApiBaseUrl: process.env.STAGING_VITE_API_BASE_URL ?? "",
  environment: "staging",
  frontendStack: stagingStack,
});

new FrontendPipelineStack(app, "DndUiPipelineStack-prod", {
  env,
  repoString,
  branch: "main",
  connectionArn,
  viteApiBaseUrl: process.env.PROD_VITE_API_BASE_URL ?? "",
  environment: "prod",
  frontendStack: prodStack,
});
