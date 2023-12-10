import { DescriptionConstant, SanitizePropertyConstant } from "./Constants";
import { getSignatureRemovedSamlAssertion } from "./decoder";
import { HarParam, hashValue } from "./hash";


export const removeHashSensitiveInfoText = (
	postDataText: string,
	selectedPostData: Record<string, boolean>,
	isHashEnabled:boolean,
	isRemovalEnabled: boolean
) => {
	try {
		let postDataParams = postDataText.split("&");
		for (let i in postDataParams) {
			let paramData = postDataParams[i].split("=");
			Object.entries(selectedPostData).map(
				([item, status]: [string, boolean]) => {
					if (paramData[0] == item && status) {
						if (paramData[0] == SanitizePropertyConstant.PASSWORD ||
						paramData[0].includes(SanitizePropertyConstant.PASS)) {
							paramData[1] = DescriptionConstant.SANITIZER_REMOVED_VALUE;
						} else if (paramData[0] == SanitizePropertyConstant.CODE) {
							paramData[1] = DescriptionConstant.HASHED + hashValue(paramData[1]);
						} else if (paramData[0] == SanitizePropertyConstant.SAML_REQUEST ||
						SanitizePropertyConstant.SAML_RESPONSE) {
							const signatureRemovedSamlAssertion =
								getSignatureRemovedSamlAssertion(paramData[1]).toString();
							paramData[1] = DescriptionConstant.SIGNATURE_VALUE_REMOVED + signatureRemovedSamlAssertion;
						} else if(isRemovalEnabled && paramData[0] != (SanitizePropertyConstant.SAML_REQUEST ||
						SanitizePropertyConstant.SAML_RESPONSE || SanitizePropertyConstant.PASSWORD ||
						paramData[0].includes(SanitizePropertyConstant.PASS))){
								paramData[1] = DescriptionConstant.SANITIZER_REMOVED_VALUE;
						} else if(isHashEnabled && paramData[0] != (SanitizePropertyConstant.SAML_REQUEST ||
						SanitizePropertyConstant.SAML_RESPONSE || SanitizePropertyConstant.PASSWORD ||
						paramData[0].includes(SanitizePropertyConstant.PASS))) {
								paramData[1] = DescriptionConstant.HASHED + hashValue(paramData[1]);
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
				entryCookies[cookieName].value = DescriptionConstant.SANITIZER_REMOVED_VALUE
			}
		});
	}
	return entryCookies;
}