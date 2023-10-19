#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/stack-stack";

const app = new cdk.App();
new AppStack(app, "prod-stack", {
  accountNumber: 1,
  region: "us-eat-1",
  stage: "production",
});
