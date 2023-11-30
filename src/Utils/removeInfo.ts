import { getSignatureRemovedSamlAssertion } from "./decoder";
import { HarParam, hashValue } from "./hash";


export const removeHashSensitiveInfoText = (
	postDataText: string,
	selectedPostData: Record<string, boolean>,
	isRemovalEnabled: boolean
) => {
	try {
		var postDataParams = postDataText.split("&");

		for (let i in postDataParams) {
			let paramData = postDataParams[i].split("=");
			Object.entries(selectedPostData).map(
				([item, status]: [string, boolean]) => {
					if (paramData[0] == item && status) {
						if (paramData[0] == "password") {
							paramData[1] = "[HAR_SANITIZER:REMOVED]";
						} else if (paramData[0] == "code") {
							paramData[1] = "Hashed:" + hashValue(paramData[1]);
						} else if (paramData[0] == "SAMLRequest") {
							const signatureRemovedSamlAssertion =
								getSignatureRemovedSamlAssertion(paramData[1]).toString();
							paramData[1] = "signatureValueRemoved:" + signatureRemovedSamlAssertion;
						} else {
							if (isRemovalEnabled) {
								paramData[1] = "[HAR_SANITIZER:REMOVED]";
							} else {
								paramData[1] = "Hashed:" + hashValue(paramData[1]);
							}
						}
					}
					postDataParams[i] = paramData.join("=");
				}
			);
		}
		return postDataParams.join("&");
	} catch (e) {
		console.log(e);
	}
};

export function removeCookies<T>(
	entryCookies: HarParam[],
	selectedCookies: Record<string, boolean>
): HarParam[] {
	for (let cookieName in entryCookies) {
		Object.entries(selectedCookies).map(([item, status]: [string, boolean]) => {
			if (entryCookies[cookieName].name == item && status) {
				entryCookies[cookieName].value = "[HAR_SANITIZER:REMOVED]"
			}
		});
	}
	return entryCookies;
}