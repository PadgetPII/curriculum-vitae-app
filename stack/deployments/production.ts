import * as cdk from "aws-cdk-lib";
import { AppStack } from "../curriculum-vitae-app-stack";

const app = new cdk.App();
new AppStack(app, "curriculum-vitae-app-production", {
  accountNumber: 1,
  region: "us-east-1",
  stage: "production",
  branchToMerge: "master",
  repoName: "curriculum-vitae-app",
  repoOwner: "PadgetPII",
});
