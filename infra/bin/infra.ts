#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";
import { GitHubOidcStack } from "../lib/github-oidc-stack";

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

const env = { account, region };

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

new GitHubOidcStack(app, "DndUiOidcStack", {
  env,
  repoOwner: "andrewgilliland",
  repoName: "dnd-ui",
  environments: [
    { environment: "dev", frontendStack: devStack },
    { environment: "staging", frontendStack: stagingStack },
    { environment: "prod", frontendStack: prodStack },
  ],
});
