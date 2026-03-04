import path from "node:path";
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
import {
  BucketDeployment,
  CacheControl,
  Source,
} from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

type Environment = "dev" | "staging" | "prod";

interface FrontendStackProps extends StackProps {
  environment: Environment;
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { environment } = props;

    const siteBucket = new Bucket(this, `dnd-ui-${environment}`, {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const distribution = new Distribution(this, `dnd-ui-${environment}-distribution`, {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(siteBucket),
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
    });

    const siteBuildPath = path.resolve(__dirname, "../../dist");

    new BucketDeployment(this, `dnd-ui-${environment}-deploy-html`, {
      sources: [Source.asset(siteBuildPath)],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/", "/index.html"],
      include: ["index.html"],
      cacheControl: [
        CacheControl.noCache(),
        CacheControl.mustRevalidate(),
        CacheControl.maxAge(Duration.seconds(0)),
      ],
      prune: false,
    });

    new BucketDeployment(this, `dnd-ui-${environment}-deploy-static-assets`, {
      sources: [Source.asset(siteBuildPath)],
      destinationBucket: siteBucket,
      distribution,
      exclude: ["index.html"],
      cacheControl: [
        CacheControl.fromString("public, max-age=31536000, immutable"),
      ],
    });

    new CfnOutput(this, `dnd-ui-${environment}-distribution-id`, {
      value: distribution.distributionId,
    });

    new CfnOutput(this, `dnd-ui-${environment}-domain-name`, {
      value: distribution.distributionDomainName,
    });
  }
}