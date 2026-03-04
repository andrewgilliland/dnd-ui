#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

const env = { account, region };

new FrontendStack(app, "DndUiStack-dev", { env, environment: "dev" });
new FrontendStack(app, "DndUiStack-staging", { env, environment: "staging" });
new FrontendStack(app, "DndUiStack-prod", { env, environment: "prod" });
