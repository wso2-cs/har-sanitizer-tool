import "./App.css";
import { useState } from "react";
import { FileInput } from "flowbite-react";
import * as HashUtils from "./Utils/hash";
import { removeSensitiveInfo } from "./Utils/removeInfo";
import { HarParam } from "./Utils/hash";
import { SanitizeSelector } from "./SanitizingSelector";

export type SanitizeState = Record<string, Record<string,boolean>>;
export const defaultSensitiveInfoList = [
	"Authorization",
	"SAMLRequest",
	"SAMLResponse",
	"access_token",
	"appID",
	"assertion",
	"code",
	"email",
	"id_token",
	"password",
  "id_token_hint",
  "commonAuthId",
  "opbs",
  "JSESSIONID",
  "Set-Cookie",
  "Cookie"

];

export const defaultSelectedSanitizeList = [ ...defaultSensitiveInfoList];

function App() {
  const fileReader = new FileReader();
  const [jsonHar, setJsonHar] = useState<string>();
  const [downloadJsonHar, setdownloadJsonHarJsonHar] = useState<any>();

  const [harError, setHarError] = useState<string>("");

  
  const defaultSanitizeList: SanitizeState = {
    cookies: {},
    headers: {},
    postData: {},
    queryStringParams: {},
  };

  const [sanitizeList, setSanitizeList] =
    useState<SanitizeState>(defaultSanitizeList);

  const handleFileChosen = (file: any) => {
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  const handleFileRead = (e: any) => {
    try {
      const content = fileReader.result;
      console.log(content);
      if (
        content &&
        (typeof content === "string" || content instanceof String)
      ) {
        var harcontent = JSON.parse(content as string);
        setdownloadJsonHarJsonHar(harcontent);
        setSanitizeList(getSanitizeItems(harcontent));
        setJsonHar(JSON.stringify(harcontent));
        setHarError("");
        return;
      }
      throw new Error("File Upload failed");
    } catch (e) {
      console.log(e);
      setHarError(`Invalid har file: ${e?.toString()}`);
    }
  };

  function getHarParamsArr(harcontent:any) {

    const harParamsArr = {
      headers: new Set<string>(),
      queryStringParams: new Set<string>(),
      cookies: new Set<string>(),
      postData: new Set<string>(),
    };

    const entries = harcontent.log.entries;
    const pages = harcontent.log.pages;
    for (let i in entries) {
      let request = entries[i].request;
      request.headers.map((header: HarParam) => harParamsArr.headers.add(header.name));
      request.cookies.map((cookie: HarParam) => harParamsArr.cookies.add(cookie.name));
      if (request.postData) {
        request.postData.params.map((postData: HarParam) => harParamsArr.postData.add(postData.name));
      }
      if (request.queryString.length != 0) {
        request.queryString.map((queryString: HarParam) => harParamsArr.queryStringParams.add(queryString.name));
      }

      let response = entries[i].response;
      response.headers.map((header: HarParam) => harParamsArr.headers.add(header.name));
		  response.cookies.map((cookie: HarParam) => harParamsArr.cookies.add(cookie.name));     
    }

    return {
      headers: [...harParamsArr.headers].sort(),
      queryStringParams: [...harParamsArr.queryStringParams].sort(),
      cookies: [...harParamsArr.cookies].sort(),
      postData: [...harParamsArr.postData].sort(),
    };
  }

  function getSanitizeItems(harcontent: string): SanitizeState {
    const sanitizeItems = getHarParamsArr(harcontent);
    const output = { ...defaultSanitizeList };
    Object.entries(sanitizeItems).map(([key, items]: [string, string[]]) => {
      output[key] = items.reduce(
        (acc, curr) => {
          if (!curr) return acc;
          acc[curr] = defaultSelectedSanitizeList.includes(curr);
          return acc;
        },
        {} as Record<string, boolean>,
      );
    });
    console.log(output);
    return output;
  }
  

  const sanitizeSensitiveInfo = (harcontent: any) => {
    let sanitizedOutput = getSanitizeItems(harcontent);
    console.log(sanitizedOutput);
    const entries = harcontent.log.entries;
    const pages = harcontent.log.pages;
    for(let entry in entries) {
      let request = entries[entry].request;
      console.log(request.cookies);
      const sanitizedReqHeaders = HashUtils.hashHeaders(request.headers, sanitizeList.headers);
      const sanitizedReqCookies = HashUtils.hashCookies(request.cookies, sanitizeList.cookies);
      request.headers = sanitizedReqHeaders;
      request.cookies = sanitizedReqCookies;
      if (request.postData) {
        const sanitizedReqpostDataText = removeSensitiveInfo(request.postData.text,sanitizeList.postData);
        const sanitizedReqPostDataParams = HashUtils.hashPostQueryParams(request.postData.params, sanitizeList.postData);
        request.postData.text = sanitizedReqpostDataText;
        request.postData.params = sanitizedReqPostDataParams;
      }

      if (request.queryString.length != 0) {
      
         const sanitizedQueryStringCodeParam = HashUtils.hashQueryStringparams(
          request.queryString, sanitizeList.queryStringParams
        );
        request.queryString = sanitizedQueryStringCodeParam;
      }

      if (request.url.includes("id_token_hint")) {
        const sanitizedReqUrlWithIDToken = HashUtils.hashIdToken(request.url, sanitizeList.queryStringParams);
        request.url = sanitizedReqUrlWithIDToken;
      }
      let response = entries[entry].response;
      const sanitizedRespHeaders = HashUtils.hashHeaders(
        response.headers, sanitizeList.headers
      );
      const sanitizedRespCookies = HashUtils.hashCookies(response.cookies, sanitizeList.cookies);
      response.headers = sanitizedRespHeaders;
      response.cookies = sanitizedRespCookies;
    }
     for (let i in pages) {
      if (pages[i].title.includes("id_token_hint")) {
        const sanitizedIDtokenPageTitle = HashUtils.hashIdToken(pages[i].title, sanitizeList.queryStringParams);
        pages[i].title = sanitizedIDtokenPageTitle;
      }
    }

    harcontent.log.entries = entries;
    harcontent.log.pages = pages;
    setdownloadJsonHarJsonHar(harcontent);
    return harcontent;
  };

  const downloadTxtFile = () => {
    var sanitizedHarContent;
    sanitizeSensitiveInfo(downloadJsonHar);
    sanitizedHarContent = JSON.stringify(downloadJsonHar);
    const element = document.createElement("a");
    const file = new Blob([sanitizedHarContent as string], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "myFile.har";
    document.body.appendChild(element);
    element.click();
    // clean up "a" element & remove ObjectURL
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  return (
    <div>
      <div className="title-sanitizer">
        <img src={require("./resources/wso2logo.png")} alt="" />
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          HAR File Sanitizer
        </h1>
      </div>
      <div className="flex flex-col max-w-2xl mx-auto">
        <div id="fileUpload">
          <FileInput
            id="file"
            helperText="Upload the HAR File for sanitization"
            onChange={(e) =>
              handleFileChosen(
                e.target.files instanceof FileList
                  ? e.target.files[0]
                  : harError
              )
            }
          />
          {harError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {harError}
            </p>
          )}
        </div>
        <div className="self-end">
          {jsonHar ? (
            <button
              type="button"
              className="object-right text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 
              focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 
              dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
              onClick={(e) => downloadTxtFile()}
            >
              Download
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <SanitizeSelector
          sanitizeItems={sanitizeList}
          setSanitizeItems={setSanitizeList}
        ></SanitizeSelector>
      </div>
    </div>
  );
}

export default App;
