#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { EventbridgeTrainingStack } from "../lib/eventbridge-training-stack";

const app = new cdk.App();
new EventbridgeTrainingStack(app, "EventbridgeTrainingStack", {
  env: { account: "ACCOUNT-ID", region: "REGION" },
});
