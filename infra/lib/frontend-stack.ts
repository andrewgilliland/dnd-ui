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

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const siteBucket = new Bucket(this, "SiteBucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const distribution = new Distribution(this, "SiteDistribution", {
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

    new BucketDeployment(this, "DeployHtml", {
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

    new BucketDeployment(this, "DeployStaticAssets", {
      sources: [Source.asset(siteBuildPath)],
      destinationBucket: siteBucket,
      distribution,
      exclude: ["index.html"],
      cacheControl: [
        CacheControl.fromString("public, max-age=31536000, immutable"),
      ],
    });

    new CfnOutput(this, "CloudFrontDistributionId", {
      value: distribution.distributionId,
    });

    new CfnOutput(this, "CloudFrontDomainName", {
      value: distribution.distributionDomainName,
    });
  }
}