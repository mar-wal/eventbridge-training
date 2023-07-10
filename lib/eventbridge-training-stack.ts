import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as events from "aws-cdk-lib/aws-events";
import * as logs from "aws-cdk-lib/aws-logs";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Template } from "aws-cdk-lib/assertions";

export class EventbridgeTrainingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bus = new events.EventBus(this, "Bus", {
      eventBusName: "mawa-dev-bus",
    });

    bus.archive("MawaDevArchive", {
      archiveName: "mawa-dev-archive",
      description: "Archive for demo reasons",
      eventPattern: {
        account: [Stack.of(this).account],
      },
      retention: Duration.days(365),
    });

    //Normal Rule
    const normalLogGroup = new logs.LogGroup(this, "NormalLogGroup", {
      logGroupName: "/aws/events/normal",
    });

    const normalTarget = new targets.CloudWatchLogGroup(normalLogGroup, {
      retryAttempts: 2,
    });

    new events.Rule(this, "NormalRule", {
      eventBus: bus,
      ruleName: "normal-rule",
      eventPattern: {
        source: ["lux"],
      },
      targets: [normalTarget],
    });

    // Rule for filter the author
    const authorLogGroup = new logs.LogGroup(this, "AuthorLogGroup", {
      logGroupName: "/aws/events/author",
    });

    const authorTarget = new targets.CloudWatchLogGroup(authorLogGroup, {
      retryAttempts: 2,
    });

    new events.Rule(this, "AuthorRule", {
      eventBus: bus,
      ruleName: "author-rule",
      eventPattern: {
        source: ["lux"],
        detail: {
          author: [{ exists: true }],
        },
      },
      targets: [authorTarget],
    });

    // Transformation Rule
    const transformationLogGroup = new logs.LogGroup(
      this,
      "TransformationLogGroup",
      {
        logGroupName: "/aws/events/transformation",
      }
    );

    const transformationRuleTargetInput = events.RuleTargetInput.fromObject({
      luxId: "$.detail.id",
      text: "$.detail.content",
      author: "$.detail.author",
    });

    const transformationTarget = new targets.CloudWatchLogGroup(
      transformationLogGroup,
      {
        logEvent: targets.LogGroupTargetInput.fromObject({
          timestamp: events.EventField.fromPath("$.time"),
          message: JSON.stringify({
            luxId: events.EventField.fromPath("$.detail.id"),
            text: events.EventField.fromPath("$.detail.content"),
            author: events.EventField.fromPath("$.detail.author"),
          }),
        }),
        retryAttempts: 2,
      }
    );

    new events.Rule(this, "TransformationRule", {
      eventBus: bus,
      ruleName: "transformation-rule",
      eventPattern: {
        source: ["lux"],
      },
      targets: [transformationTarget],
    });
  }
}
