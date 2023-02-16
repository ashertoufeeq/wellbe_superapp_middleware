const { pdfMerge, getFileBufferFromUrl } = require("../utils/pdfMerge");

module.exports = async  (urls) => {
    let i =  1   
    const pdfLinks = [];
    for(const url of urls){
        console.log(i);
        const buffer = await getFileBufferFromUrl(url);
        pdfLinks.push(buffer);

        if(i === urls.length){
        const { mergedUrl, error } =
           await pdfMerge({pdfLinks})
        console.log({mergedUrl,error })
        }
        i=i+1
    }

}
