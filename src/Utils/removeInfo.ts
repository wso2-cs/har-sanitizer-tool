import { decodeValue } from "./decoder";
import { hashValue } from "./hash";
export const removeSensitiveInfo = (postDataText:string) => {
  try {
    console.log(postDataText.toString());
    var postDataParams = postDataText.split("&");
    
    for (let i in postDataParams) {
      let paramData = postDataParams[i].split("=");
      if(paramData[0] == "password") {
        paramData[1] = "[MASKED]";
      } else if (paramData[0] == "code") {
        paramData[1] = "Hashed:" + hashValue(paramData[1]);
      } else if(paramData[0] == "SAMLRequest") {
        console.log(decodeValue(paramData[1]));
      }
      postDataParams[i] = paramData.join("=");
      console.log(postDataParams[i]);
    }
    return postDataParams.join("&");
  } catch (e) {
    console.log(e);
  }
    
  }
