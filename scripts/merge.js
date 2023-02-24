const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");
const sendMessageBird = require("../utils/message");

module.exports = async  (urls, send= true) => {
    let i =  1   
    const pdfLinks = [];
    for(const url of urls){
        console.log(i);
        const buffer = await getFileBufferFromUrl(url);
        pdfLinks.push(buffer);
        if(i === urls.length){
        const { mergedUrl, error } =
           await pdfMerge({pdfLinks});
           console.log({mergedUrl,error });
           if(!error && send){
            await sendMessageBird({
                toMultiple: false,
                to: '9557807977',
                media: { url: mergedUrl },
                smsParameters: [mergedUrl],
                templateId: "healthreport",
              });
            }
            return mergedUrl;
        }
        i=i+1
    }

}
