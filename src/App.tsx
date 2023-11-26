import "./App.css";
import { useState } from "react";
import { FileInput, Label, Button } from "flowbite-react";
import * as HashUtils from "./Utils/hash";
import { removeSensitiveInfo } from "./Utils/removeInfo";
import { HarParam } from "./Utils/hash";
import { SanitizeSelector } from "./SanitizingSelector";

export type SanitizeState = Record<string, string[]>;

function App() {
  const fileReader = new FileReader();
  const [jsonHar, setJsonHar] = useState<string>();
  const [harError, setHarError] = useState<string>("");

  const defaultSanitizeList: SanitizeState = {
    cookies: [] as string[],
    headers: [] as string[],
    postData: [] as string[],
    queryStringParams: [] as string[],
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
        var sanitizedHarContent;
        sanitizedHarContent = sanitizeSensitiveInfo(harcontent);
        console.log(sanitizedHarContent);
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

  function addToUniqueSanitizeList(
    cookies: any[],
    headers: any[],
  ) {
    Object.keys(sanitizeList).forEach((key) => {
      if (key == "cookies" && cookies) {
        addToUniqueArray(cookies, key);
      } else if(key == "headers" && headers) {
        addToUniqueArray(headers, key);
      } 
    });
    console.log(sanitizeList);
  }

  function addToUniqueSanitizeListPostData(
    postData: any[],
  ) {
    Object.keys(sanitizeList).forEach((key) => {
      if (key == "postData" && postData) {
        addToUniqueArray(postData, key);
      }
    });
  }


  function addToUniqueSanitizeListQueryParams(
    queryStringParams: any[],
  ) {
    Object.keys(sanitizeList).forEach((key) => {
      if (key == "queryStringParams" && queryStringParams) {
        addToUniqueArray(queryStringParams, key);
      }
    });
  }
  
  function addToUniqueArray(paramList:any[], key:string) {
    for (let i in paramList) {
      if (!sanitizeList[key].includes(paramList[i].name)) {
        sanitizeList[key].push(paramList[i].name);
      }
    }
  }

  const sanitizeSensitiveInfo = (harcontent: any) => {
    const entries = harcontent.log.entries;
    const pages = harcontent.log.pages;
    for (let i in entries) {
      let request = entries[i].request;
      addToUniqueSanitizeList(request.cookies, request.headers);
      const sanitizedReqHeaderCookies = HashUtils.hashHeaderCookies(
        request.headers
      );
      const sanitizedReqCookies = HashUtils.hashCookies(request.cookies);
      request.headers = sanitizedReqHeaderCookies;
      request.cookies = sanitizedReqCookies;
      if (request.postData) {
        console.log(request.postData.toString());
         addToUniqueSanitizeListPostData(request.postData.params);
        const sanitizedReqpostDataText = removeSensitiveInfo(
          request.postData.text
        );
        const sanitizedReqPostDataParams = HashUtils.hashPostQueryParams(
          request.postData.params
        );
        request.postData.text = sanitizedReqpostDataText;
        request.postData.params = sanitizedReqPostDataParams;
      }
      if (request.queryString.length != 0) {
        addToUniqueSanitizeListQueryParams(request.queryString);
        const sanitizedQueryStringCodeParam = HashUtils.hashQueryStringparams(
          request.queryString
        );
        request.queryString = sanitizedQueryStringCodeParam;
      }

      if (request.url.includes("id_token_hint")) {
        const sanitizedReqUrlWithIDToken = HashUtils.hashIdToken(request.url);
        request.url = sanitizedReqUrlWithIDToken;
      }

      let response = entries[i].response;
      addToUniqueSanitizeList(response.cookies, response.headers);
      const sanitizedRespHeaderCookies = HashUtils.hashHeaderCookies(
        response.headers
      );
      const sanitizedRespCookies = HashUtils.hashCookies(response.cookies);
      response.headers = sanitizedRespHeaderCookies;
      response.cookies = sanitizedRespCookies;
    }

    for (let i in pages) {
      if (pages[i].title.includes("id_token_hint")) {
        const sanitizedIDtokenPageTitle = HashUtils.hashIdToken(pages[i].title);
        pages[i].title = sanitizedIDtokenPageTitle;
      }
    }
    console.log(sanitizeList);

    harcontent.log.entries = entries;
    harcontent.log.pages = pages;
    return harcontent;
  };

  // // This function will be triggered when a checkbox changes its state
  // const selectSanitizeItem = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedValue = event.target.value;

  //   // Check if "ids" contains "selectedIds"
  //   // If true, this checkbox is already checked
  //   // Otherwise, it is not selected yet
  //   if (selectedSanitizeList.cookies.includes(selectedValue)) {
  //     const selectedValues = selectedSanitizeList.cookies.filter(
  //       (value) => value !== selectedValue
  //     );
  //     selectedSanitizeList.cookies = selectedValues;
  //   } else {
  //     const newSel = [...selectedSanitizeList.cookies];
  //     newSel.push(selectedValue);
  //     selectedSanitizeList.cookies = newSel;
  //   }
  // };

  const getCookieValuesUnique = () => {
    console.log(sanitizeList.cookies.values());
    return sanitizeList.cookies;
  };

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([jsonHar as string], { type: "application/json" });
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
              className="object-right text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
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
