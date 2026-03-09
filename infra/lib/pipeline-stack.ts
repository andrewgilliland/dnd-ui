import { Stack, StackProps } from "aws-cdk-lib";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeStarConnectionsSourceAction,
  CodeBuildAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import {
  PipelineProject,
  BuildSpec,
  LinuxBuildImage,
  BuildEnvironmentVariableType,
} from "aws-cdk-lib/aws-codebuild";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { FrontendStack } from "./frontend-stack";

type Environment = "dev" | "staging" | "prod";

export interface FrontendPipelineStackProps extends StackProps {
  readonly repoString: string;
  readonly branch: string;
  readonly connectionArn: string;
  readonly viteApiBaseUrl: string;
  readonly environment: Environment;
  readonly frontendStack: FrontendStack;
}

export class FrontendPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendPipelineStackProps) {
    super(scope, id, props);

    const {
      repoString,
      branch,
      connectionArn,
      viteApiBaseUrl,
      environment,
      frontendStack,
    } = props;
    const [owner, repo] = repoString.split("/");

    const sourceArtifact = new Artifact("Source");

    const buildProject = new PipelineProject(
      this,
      `dnd-ui-${environment}-build`,
      {
        projectName: `dnd-ui-${environment}-build`,
        buildSpec: BuildSpec.fromSourceFilename("buildspec.yml"),
        environment: {
          buildImage: LinuxBuildImage.STANDARD_7_0,
        },
        environmentVariables: {
          VITE_API_BASE_URL: {
            value: viteApiBaseUrl,
            type: BuildEnvironmentVariableType.PLAINTEXT,
          },
          ENVIRONMENT: {
            value: environment,
            type: BuildEnvironmentVariableType.PLAINTEXT,
          },
        },
      },
    );

    frontendStack.siteBucket.grantReadWrite(buildProject);

    buildProject.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/dnd-ui/${environment}/*`,
        ],
      }),
    );

    buildProject.addToRolePolicy(
      new PolicyStatement({
        actions: ["cloudfront:CreateInvalidation"],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${frontendStack.distribution.distributionId}`,
        ],
      }),
    );

    new Pipeline(this, `dnd-ui-${environment}`, {
      pipelineName: `dnd-ui-${environment}`,
      stages: [
        {
          stageName: "Source",
          actions: [
            new CodeStarConnectionsSourceAction({
              actionName: "GitHub_Source",
              owner,
              repo,
              branch,
              connectionArn,
              output: sourceArtifact,
            }),
          ],
        },
        {
          stageName: "Build_and_Deploy",
          actions: [
            new CodeBuildAction({
              actionName: "Build_and_Deploy",
              project: buildProject,
              input: sourceArtifact,
            }),
          ],
        },
      ],
    });
  }
}
