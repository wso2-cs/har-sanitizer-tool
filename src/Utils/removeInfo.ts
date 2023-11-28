import { getSignatureRemovedSamlAssertion } from "./decoder";
import { hashValue } from "./hash";

export const removeSensitiveInfo = (postDataText: string, selectedPostData:Record<string, boolean>) => {
  try {
    var postDataParams = postDataText.split("&");

    for (let i in postDataParams) {
      let paramData = postDataParams[i].split("=");
      Object.entries(selectedPostData).map(([item, status]: [string, boolean])=> {

        if(paramData[0] == item && status) {
          if (paramData[0] == "password") {
            paramData[1] = "[MASKED]";
          } else if (paramData[0] == "code") {
            paramData[1] = "Hashed:" + hashValue(paramData[1]);
          } else if (paramData[0] == "SAMLRequest") {
            const signatureRemovedSamlAssertion = getSignatureRemovedSamlAssertion(paramData[1]).toString();
            paramData[1] = "signatureValueRemoved:" + signatureRemovedSamlAssertion;
          }
        }
        postDataParams[i] = paramData.join("=");
      })
    }
    return postDataParams.join("&");
  } catch (e) {
    console.log(e);
  }

}


