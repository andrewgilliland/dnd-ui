import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
  OpenIdConnectProvider,
  Role,
  WebIdentityPrincipal,
  PolicyStatement,
  Effect,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { FrontendStack } from "./frontend-stack";

interface EnvironmentConfig {
  environment: "dev" | "staging" | "prod";
  frontendStack: FrontendStack;
}

interface GitHubOidcStackProps extends StackProps {
  repoOwner: string;
  repoName: string;
  environments: EnvironmentConfig[];
}

export class GitHubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: GitHubOidcStackProps) {
    super(scope, id, props);

    const { repoOwner, repoName, environments } = props;

    const provider = OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "GitHubOidcProvider",
      `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
    );

    for (const { environment, frontendStack } of environments) {
      const deployRole = new Role(this, `dnd-ui-${environment}-deploy-role`, {
        roleName: `dnd-ui-${environment}-github-deploy`,
        assumedBy: new WebIdentityPrincipal(provider.openIdConnectProviderArn, {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
          StringLike: {
                "token.actions.githubusercontent.com:sub": `repo:${repoOwner}/${repoName}:environment:${environment}`,
          },
        }),
      });

      deployRole.addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["ssm:GetParameter"],
          resources: [
            `arn:aws:ssm:${this.region}:${this.account}:parameter/dnd-ui/${environment}/*`,
          ],
        }),
      );

      frontendStack.siteBucket.grantReadWrite(deployRole);

      deployRole.addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["cloudfront:CreateInvalidation"],
          resources: [
            `arn:aws:cloudfront::${this.account}:distribution/${frontendStack.distribution.distributionId}`,
          ],
        }),
      );

      new CfnOutput(this, `dnd-ui-${environment}-deploy-role-arn`, {
        value: deployRole.roleArn,
        description: `GitHub Actions deploy role ARN for ${environment}`,
      });
    }
  }
}
