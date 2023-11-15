import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import sha256 from "fast-sha256";
import { FileInput, Label, Button } from 'flowbite-react';

const ImportFromFileBodyComponent = () => {
  let fileReader;
  var fileDownloadUrl;
  var jsonHar;

  const [harError, setHarError] = useState("");

  const handleFileRead = (e) => {
    try {
      const content = fileReader.result;
      console.log(content);
      if((content && (typeof content === "string" || content instanceof String))) {
        var harcontent = JSON.parse(content);
        var sanitizedHarContent;
        sanitizedHarContent=sanitizeSensitiveInfo(harcontent);
        console.log(sanitizedHarContent);
        jsonHar = JSON.stringify(harcontent);
        setHarError("");
        return;
      }
      throw new Error("File Upload failed");
     } catch(e) {
      console.log(e);
      setHarError(`Invalid har file: ${e?.  toString()}`);
    }
  }

  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  const hashCookies = (cookies) => {

    for (var i in cookies) {
      var hashed = hashValue(cookies[i].value);
      cookies[i].value = "Hashed: " + hashed;
    }

    return cookies;
  };

  const hashHeaderCookies = (headers) => {
    for(let i in headers) {
      console.log(headers[i]);
      if(headers[i].name=="Cookie" || headers[i].name=="Set-Cookie") {
        const array = headers[i].value.split(';');
        for(let i in array) {
          const array1 = array[i].split('=');
          array1[1] = hashValue(array1[1]);
          array[i] = array1.join("=Hashed:");
        }
        const hashedValues = array.join(";");
        headers[i].value = hashedValues;
      } else if(headers[i].name=="Authorization") {
        const authorizationValue = headers[i].value.split(" ");
        const token = authorizationValue[1];
        console.log(token);
        if(token.includes(".")) {
          authorizationValue[1] = token.substring(0, token.lastIndexOf("."));
          console.log(authorizationValue[1]);
          headers[i].value=authorizationValue.join(" SignRemoved:");
          console.log(headers[i].value);
        } else {
          authorizationValue[1]=hashValue(token);
          headers[i].value=authorizationValue.join(" Hashed:");
        }
      }
    }
    console.log(headers);
    return headers;
  }
  
  const hashPostQueryParams = (postDataParams) => {
    //var postDataParams = harcontent.log.entries[63].request.postData.params;
    for(let i in postDataParams) {
      if(postDataParams[i].name=="code") {
        postDataParams[i].value = " Hashed:" +hashValue(postDataParams[i].value);
      }
    }
    return postDataParams;
  }

  const hashQueryStringparams = (queryStringParams) => {
    for (let i in queryStringParams) {
      if(queryStringParams[i].name == "code") {
        queryStringParams[i].value = " Hashed: " +hashValue(queryStringParams[i].value);
      }
    }
    return queryStringParams;
  }

  const hashIdToken = (value) => {
   
    var baseurl = value.substring(0, value.indexOf("?"));
    var urlparams = value.substring(value.indexOf("?")+1, value.length).split("&");
    console.log(urlparams);
    for(let i in urlparams) {
      var props = urlparams[i].split("=");
      if(props[0]=="id_token_hint") {
        const token = props[1];
        console.log(token);
        if(token.includes(".")) {
          props[1] = "Signature Removed:"+token.substring(0, token.lastIndexOf("."));
        }
      }
      urlparams[i]=props.join("=");
      return value=baseurl+"?"+(urlparams.join("&"));
    }
  }

  const hashValue = (value) => {
    const encoder = new TextEncoder();
      const msgUint8 = encoder.encode(value);
  
      var sha256HashedValue = sha256(msgUint8);
  
      const hashArray = Array.from(new Uint8Array(sha256HashedValue));
      const hashed = hashArray
        .map((b) => b.toString(24).padStart(2, "3"))
        .join(""); // convert bytes to hex string
        return hashed;
  }

  const maskSensitiveInfo = (postDataText) => {
  
    console.log(postDataText.toString());
    var postDataParams = postDataText.split("&");
    
    for (let i in postDataParams) {
      let paramData = postDataParams[i].split("=");
      if(paramData[0] == "password") {
        paramData[1] = "[MASKED]";
      } else if (paramData[0] == "code") {
        paramData[1] = "Hashed:" +hashValue(paramData[1]);
      }
      postDataParams[i] = paramData.join("=");
      console.log(postDataParams[i]);
    }
    return postDataParams.join("&");
  }

  const sanitizeSensitiveInfo = (harcontent) => {
    const entries = harcontent.log.entries;
    const pages = harcontent.log.pages;
    for(let i in entries) {
      let request = entries[i].request;
      const sanitizedReqHeaderCookies = hashHeaderCookies(request.headers);
      console.log("in main" +request.headers);
      const sanitizedReqCookies = hashCookies(request.cookies);
      request.headers=sanitizedReqHeaderCookies;
      request.cookies=sanitizedReqCookies;
      if(request.postData) {
        console.log(request.postData.toString());
        const sanitizedReqpostDataText = maskSensitiveInfo(request.postData.text);
        const sanitizedReqPostDataParams = hashPostQueryParams(request.postData.params);
        request.postData.text=sanitizedReqpostDataText;
        request.postData.params=sanitizedReqPostDataParams;
      }
      if(request.queryString.length != 0) {
        const sanitizedQueryStringCodeParam = hashQueryStringparams(request.queryString);
        request.queryString = sanitizedQueryStringCodeParam;
      }
     
      if(request.url.includes("id_token_hint")) {
        const sanitizedReqUrlWithIDToken= hashIdToken(request.url);
        request.url=sanitizedReqUrlWithIDToken;
      }

      let response = entries[i].response;
      const sanitizedRespHeaderCookies = hashHeaderCookies(response.headers);
      const sanitizedRespCookies = hashCookies(response.cookies);
      response.headers=sanitizedRespHeaderCookies;
      response.cookies=sanitizedRespCookies;
    }
    
    for(let i in pages) {
      if(pages[i].title.includes("id_token_hint")) {
        const sanitizedIDtokenPageTitle = hashIdToken(pages[i].title);
        pages[i].title=sanitizedIDtokenPageTitle;
      }
    }

    harcontent.log.entries=entries;
    harcontent.log.pages=pages;
    return harcontent;
  }


  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([jsonHar], {type: 'application/json'});
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
        <img src={require('./Images/wso2logo.png')} alt=""/>
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">HAR File Sanitizer</h1>
      </div>
      <div className="flex flex-col max-w-2xl mx-auto">
        <div id="fileUpload">
          <FileInput id="file" helperText="Upload the HAR File for sanitization"  onChange={(e) => handleFileChosen(e.target.files[0])} />
          {harError && <p class="mt-2 text-sm text-red-600 dark:text-red-500">{harError}</p>}
        </div>
        <div className="self-end">
          <button type="button" class="object-right text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          onClick={(e) => downloadTxtFile()}>Download</button>
        </div>  
      </div>
    </div>
  );
};

export default ImportFromFileBodyComponent;
