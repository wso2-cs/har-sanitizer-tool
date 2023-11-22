import './App.css';
import { useState } from "react";
import { FileInput, Label, Button } from 'flowbite-react';
import * as HashUtils from './Utils/hash';
import { removeSensitiveInfo } from './Utils/removeInfo';
import { decodeValue } from './Utils/decoder';
import { HarParam } from './Utils/hash';
function App() {

  const fileReader = new FileReader();
  const [jsonHar, setJsonHar] = useState<string>();
  const [harError, setHarError] = useState<string>("");
  const sanitizeList = {
    "cookies": [] as string[],
    "headers": [] as string[],
    "postData": [] as string[],
    "queryStringParams": [] as string[] 
  }


  const handleFileChosen = (file:any) => {
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  }

  const handleFileRead = (e:any) => {
    try {
      const content = fileReader.result;
      console.log(content);
      if((content && (typeof content === "string" || content instanceof String))) {
        var harcontent = JSON.parse(content as string);
        var sanitizedHarContent;
        sanitizedHarContent=sanitizeSensitiveInfo(harcontent);
        console.log(sanitizedHarContent);
        setJsonHar(JSON.stringify(harcontent));
        setHarError("");
        return;
      }
      throw new Error("File Upload failed");
     } catch(e) {
      console.log(e);
      setHarError(`Invalid har file: ${e?.  toString()}`);
    }
  }

  function addToUniqueCookies<T>(cookies: HarParam<T>[]) {
    for(let i in cookies) {
      sanitizeList.cookies.push(cookies[i].name);
    }
  }

  const removeSAMLSign = (value:any) => {
    const decodedSAML = decodeValue(value);
    console.log(decodedSAML);
  //  const SignRemovedSAML = 
  }



  const sanitizeSensitiveInfo = (harcontent:any) => {
    const entries = harcontent.log.entries;
    const pages = harcontent.log.pages;
    for(let i in entries) {
      let request = entries[i].request;
      const sanitizedReqHeaderCookies = HashUtils.hashHeaderCookies(request.headers);
      console.log("in main" +request.headers);
      const sanitizedReqCookies = HashUtils.hashCookies(request.cookies);
      request.headers=sanitizedReqHeaderCookies;
      request.cookies=sanitizedReqCookies;
      if(request.postData) {
        console.log(request.postData.toString());
        const sanitizedReqpostDataText = removeSensitiveInfo(request.postData.text);
        const sanitizedReqPostDataParams = HashUtils.hashPostQueryParams(request.postData.params);
        request.postData.text=sanitizedReqpostDataText;
        request.postData.params=sanitizedReqPostDataParams;
      }
      if(request.queryString.length != 0) {
        const sanitizedQueryStringCodeParam = HashUtils.hashQueryStringparams(request.queryString);
        request.queryString = sanitizedQueryStringCodeParam;
      }
     
      if(request.url.includes("id_token_hint")) {
        const sanitizedReqUrlWithIDToken= HashUtils.hashIdToken(request.url);
        request.url=sanitizedReqUrlWithIDToken;
      }

      let response = entries[i].response;
      const sanitizedRespHeaderCookies = HashUtils.hashHeaderCookies(response.headers);
      const sanitizedRespCookies = HashUtils.hashCookies(response.cookies);
      response.headers=sanitizedRespHeaderCookies;
      response.cookies=sanitizedRespCookies;
    }
    
    for(let i in pages) {
      if(pages[i].title.includes("id_token_hint")) {
        const sanitizedIDtokenPageTitle = HashUtils.hashIdToken(pages[i].title);
        pages[i].title=sanitizedIDtokenPageTitle;
      }
    }
    harcontent.log.entries=entries;
    harcontent.log.pages=pages;
    return harcontent;
  }


  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([jsonHar as string], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = "myFile.har";
    document.body.appendChild(element);
    element.click();
     // clean up "a" element & remove ObjectURL
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }


  return (
    <div> 
    <div className="title-sanitizer">
      <img src={require('./resources/wso2logo.png')} alt=""/>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">HAR File Sanitizer</h1>
    </div>
    <div className="flex flex-col max-w-2xl mx-auto">
      <div id="fileUpload">
      <FileInput id="file" helperText="Upload the HAR File for sanitization"  onChange={(e) => handleFileChosen(e.target.files instanceof FileList
              ? e.target.files[0] : harError)} />        
              {harError && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{harError}</p>}
      </div>
      <div className="self-end">
      {jsonHar ? <button type="button" className="object-right text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        onClick={(e) => downloadTxtFile()}>Download</button> : null}
      </div>  
    </div>
  </div>

  );
}

export default App;
