import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as elasticbeanstalk from "aws-cdk-lib/aws-elasticbeanstalk";
import * as codeBuild from "aws-cdk-lib/aws-codebuild";
import * as IAM from "aws-cdk-lib/aws-iam";

interface LocalStackProps extends cdk.StackProps {
  branchToMerge: string;
  repoName: string;
  repoOwner: string;
  accountNumber: number;
  region: string;
  stage: string;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LocalStackProps) {
    super(scope, id, props);

    const appName = "curriculum-vitae-app";

    const ebApplication = new elasticbeanstalk.CfnApplication(
      this,
      `${appName}`
    );

    const ebEnvironment = new elasticbeanstalk.CfnEnvironment(
      this,
      `${appName}-env`,
      {
        applicationName: appName,
        environmentName: props.stage,
        solutionStackName: `64bit Amazon Linux 2023 v6.0.2 running Node.js 18`,
        optionSettings: [
          {
            namespace: "aws:autoscaling:launchconfiguration",
            optionName: "IamInstanceProfile",
            value: "aws-elasticbeanstalk-ec2-role",
          },
        ],
      }
    );

    ebEnvironment.addDependency(ebApplication);

    const webhooks: codeBuild.FilterGroup[] = [
      codeBuild.FilterGroup.inEventOf(
        codeBuild.EventAction.PUSH,
        codeBuild.EventAction.PULL_REQUEST_MERGED
      ).andHeadRefIs(props.branchToMerge),
    ];

    const repo = codeBuild.Source.gitHub({
      owner: props.repoOwner,
      repo: props.repoName,
      webhook: true,
      webhookFilters: webhooks,
      reportBuildStatus: true,
    });

    const project = new codeBuild.Project(this, `${appName}-codebuild`, {
      buildSpec: codeBuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      projectName: `${appName}-codebuild`,
      environment: {
        buildImage: codeBuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        computeType: codeBuild.ComputeType.SMALL,
      },
      source: repo,
      timeout: cdk.Duration.minutes(20),
    });

    project.role?.addManagedPolicy(
      IAM.ManagedPolicy.fromAwsManagedPolicyName(
        "AdministratorAccess-AWSElasticBeanstalk"
      )
    );
  }
}
