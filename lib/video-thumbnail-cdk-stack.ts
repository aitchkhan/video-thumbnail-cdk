import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { CorsHttpMethod, HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

import { Construct } from "constructs";
import { CfnOutput } from "aws-cdk-lib";

export class VideoThumbnailCdkStack extends cdk.Stack {
  public readonly thumbnailBucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const videoBucket = new s3.Bucket(
      this,
      "video-thumbnail-cdk-tech-ventures",
      {
        objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
        bucketName: "video-thumbnail-cdk-tech-ventures",
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "video-thumbnail-cdk-tech-ventures-oai",
      {
        comment: "oai for video-thumbnail-cdk-tech-ventures",
      }
    );
    const cloudFrontDistribution = new cloudfront.Distribution(
      this,
      "cloudfront-distribution-video-thumbnail-cdk-tech-ventures",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(videoBucket, {
            originAccessIdentity,
          }),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      }
    );
    const getPreSignedUrlLambda = new lambda.Function(
      this,
      "get-preSigned-url-lambda",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        memorySize: 128,
        timeout: cdk.Duration.seconds(15),
        handler: "index.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "lambda")),
      }
    );

    videoBucket.grantPutAcl(getPreSignedUrlLambda);

    const api = new HttpApi(this, "video-thumbnail-cdk-api", {
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT, CorsHttpMethod.OPTIONS],
        allowHeaders: [
          "Authorization",
          "Content-Type",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
        ],
      },
      apiName: "video-thumbnail-cdk-api",
      createDefaultStage: false,
    });

    new CfnOutput(this, "video-thumbnail-cdk-api-url", { value: api.url! });

    // const integration = new HttpLambdaIntegration(this, "get-preSigned-url-lambda-integration", {
    // api.addRoutes({
  }
}
