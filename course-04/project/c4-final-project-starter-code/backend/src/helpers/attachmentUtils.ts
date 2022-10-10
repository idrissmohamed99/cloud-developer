import * as AWS from 'aws-sdk'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class attachmentUtils {

    constructor(

        private readonly bucket = process.env.ATTACHMENT_S3_BUCKET,

        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly expires = process.env.SIGNED_URL_EXPIRATION,

    ) { }

    async fileExists(todoId: string): Promise<boolean> {
        try {
            await this.s3.headObject({
                Bucket: this.bucket,
                Key: todoId
            })
            .promise()

            return true

        } catch (error) {
            return false
        }

    }

    getUploadUrl(todoId: string) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucket,
            Key: todoId,
            Expires: this.expires
        })
    }



    getDownloadUrl(todoId: string) {
        return this.s3.getSignedUrl('getObject', {
            Bucket: this.bucket,
            Key: todoId,
            Expires: this.expires
        })
    }


}