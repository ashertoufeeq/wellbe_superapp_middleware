const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");
const sendMessageBird = require("../utils/message");
const {analyticsModel} = require("../models/analytics.model");

const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET,
  Bucket: process.env.BUCKET_NAME,
});


module.exports = async  () => {
    i = 1;
    const labCursor = analyticsModel
    .aggregate([], { allowDiskUse: true })
    .cursor();    

   for (
      let action = await labCursor.next();
      true;
      action = await labCursor.next()
    ) {
      if(action){
        console.log(i, action);
        const url = action['Labour Id File']
        if(url){
        const buffer = await getFileBufferFromUrl(url);

        const type = url?.split('.')?.pop() || 'pdf'
        var params = {
            ACL: "public-read",
            // ContentType: `application/${type}`,
            Key:action.Camp +'_'+action?.UHID +Date.now() + '.' + type,
            Body: buffer,
            Bucket: process.env.BUCKET_NAME,
          };
          s3.upload(params, (uploaderr, data1) => {
            if (uploaderr) {
            console.log('error in uploading')
            }
            console.log(data1?.Location,'uploaded')
          });
        }else{
            console.log('No Labour Id', action.UHID)
        }
       }else{
        console.log('....... FINISHED .........')
        break;
    }
        i=i+1
    }

}
