import { Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { FrontendStack } from "./frontend-stack";

interface FrontendAppStageProps extends StageProps {
  stackName?: string;
}

class FrontendAppStage extends Stage {
  readonly frontendStack: FrontendStack;

  constructor(scope: Construct, id: string, props: FrontendAppStageProps) {
    super(scope, id, props);

    this.frontendStack = new FrontendStack(
      this,
      props.stackName ?? "FrontendStack",
      {
        env: props.env,
      },
    );
  }
}

export interface FrontendPipelineStackProps extends StackProps {
  readonly repoString: string;
  readonly branch: string;
  readonly connectionArn: string;
  readonly viteApiBaseUrl: string;
}

export class FrontendPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendPipelineStackProps) {
    super(scope, id, props);

    const source = CodePipelineSource.connection(
      props.repoString,
      props.branch,
      {
        connectionArn: props.connectionArn,
      },
    );

    const pipeline = new CodePipeline(this, "FrontendPipeline", {
      pipelineName: "dnd-ui-frontend-pipeline",
      synth: new ShellStep("Synth", {
        input: source,
        env: {
          VITE_API_BASE_URL: props.viteApiBaseUrl,
        },
        commands: [
          "npm ci",
          "npm run build",
          "cd infra",
          "npm ci",
          "npm run build",
          `npx cdk synth -c deployPipeline=true -c connectionArn='${props.connectionArn}' -c repo='${props.repoString}' -c branch='${props.branch}' -c viteApiBaseUrl='${props.viteApiBaseUrl}'`,
        ],
        primaryOutputDirectory: "infra/cdk.out",
      }),
      selfMutation: true,
    });

    const appStage = new FrontendAppStage(this, "Production", {
      env: props.env,
      stackName: "FrontendStack",
    });

    pipeline.addStage(appStage);
  }
}
