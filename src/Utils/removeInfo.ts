import { hashValue } from "./hash";
export const removeSensitiveInfo = (postDataText:string) => {
  
    console.log(postDataText.toString());
    var postDataParams = postDataText.split("&");
    
    for (let i in postDataParams) {
      let paramData = postDataParams[i].split("=");
      if(paramData[0] == "password") {
        paramData[1] = "[MASKED]";
      } else if (paramData[0] == "code") {
        paramData[1] = "Hashed:" + hashValue(paramData[1]);
      }
      postDataParams[i] = paramData.join("=");
      console.log(postDataParams[i]);
    }
    return postDataParams.join("&");
  }
