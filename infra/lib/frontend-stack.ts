import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  Distribution,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

type Environment = "dev" | "staging" | "prod";

interface FrontendStackProps extends StackProps {
  environment: Environment;
}

export class FrontendStack extends Stack {
  readonly siteBucket: Bucket;
  readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { environment } = props;

    this.siteBucket = new Bucket(this, `dnd-ui-${environment}`, {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.distribution = new Distribution(
      this,
      `dnd-ui-${environment}-distribution`,
      {
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(this.siteBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: CachedMethods.CACHE_GET_HEAD,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        },
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: Duration.seconds(0),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: Duration.seconds(0),
          },
        ],
      },
    );

    new StringParameter(this, `dnd-ui-${environment}-bucket-name-param`, {
      parameterName: `/dnd-ui/${environment}/bucket-name`,
      stringValue: this.siteBucket.bucketName,
    });

    new StringParameter(this, `dnd-ui-${environment}-distribution-id-param`, {
      parameterName: `/dnd-ui/${environment}/distribution-id`,
      stringValue: this.distribution.distributionId,
    });

    new CfnOutput(this, `dnd-ui-${environment}-distribution-id`, {
      value: this.distribution.distributionId,
    });

    new CfnOutput(this, `dnd-ui-${environment}-domain-name`, {
      value: this.distribution.distributionDomainName,
    });
  }
}
