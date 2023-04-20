import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const datasetBucket = "defillama-datasets";

const R2_ENDPOINT = "https://" + process.env.R2_ENDPOINT!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;

const R2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function deleteObjects(
    protocolId: string,
) {
    const cacheKey = (useNewChainNames:boolean, useHourlyData:boolean) => `protocolCache/${protocolId}-${useNewChainNames}-${useHourlyData}`
    const keys = [
        [true, true],
        [true, false],
        [false, true],
        [false, false]
    ].map(t=>({Key:cacheKey(t[0], t[1])}))
    const command = new DeleteObjectsCommand({
        Bucket: datasetBucket,
        Delete:{
            Objects:keys
        }
    })
    return await R2.send(command);
}