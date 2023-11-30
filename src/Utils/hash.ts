import sha256 from "fast-sha256";
import { getSignatureRemovedSamlAssertion } from "./decoder";

export interface HarParam {
	name: string;
	value: string;
}

export const hashValue = (hashValue: string) => {
	const encoder = new TextEncoder();
	const msgUint8 = encoder.encode(hashValue);

	const sha256HashedValue = sha256(msgUint8);

	const hashArray = Array.from(new Uint8Array(sha256HashedValue));
	const hashed = hashArray.map((b) => b.toString(24).padStart(2, "3")).join(""); // convert bytes to hex string
	return hashed;
};

export function hashCookies<T>(
	entryCookies: HarParam[],
	selectedCookies: Record<string, boolean>
): HarParam[] {
	for (let cookieName in entryCookies) {
		Object.entries(selectedCookies).map(([item, status]: [string, boolean]) => {
			if (entryCookies[cookieName].name == item && status) {
				var hashed = hashValue(entryCookies[cookieName].value);
				entryCookies[cookieName].value = "Hashed: " + hashed;
			}
		});
	}
	return entryCookies;
}

export function hashRemoveHeaders<T>(
	entryHeaders: any,
	selectedHeaders: Record<string, boolean>,
	hashEnabled: boolean
): any[] {
	for (let headerName in entryHeaders) {
		Object.entries(selectedHeaders).map(([item, status]: [string, boolean]) => {
			if (entryHeaders[headerName].name == item && status) {
				if (
					entryHeaders[headerName].name == "Cookie" ||
					entryHeaders[headerName].name == "Set-Cookie"
				) {
					const array = entryHeaders[headerName].value.split(";");
					for (let i in array) {
						const array1 = array[i].split(/=(.*)/, 2);
						array1[1] = hashValue(array1[1]);
						array[i] = array1.join("=Hashed:");
					}
					const hashedValues = array.join(";");
					entryHeaders[headerName].value = hashedValues;
				} else if (entryHeaders[headerName].name == "Authorization") {
					const authorizationValue = entryHeaders[headerName].value.split(" ");
					const token = authorizationValue[1];
					//  console.log(token);
					if (token.includes(".")) {
						authorizationValue[1] = token.substring(0, token.lastIndexOf("."));
						//console.log(authorizationValue[1]);
						entryHeaders[headerName].value =
							authorizationValue.join(" SignRemoved:");
						//console.log(headers[i].value);
					} else {
						authorizationValue[1] = hashValue(token);
						entryHeaders[headerName].value =
							authorizationValue.join(" Hashed:");
					}
				}
				if (hashEnabled) {
					const hashedValue = hashValue(entryHeaders[headerName].value);
					entryHeaders[headerName].value = "Hashed:" + hashedValue;

				} else {
					entryHeaders[headerName].value = "[HAR_SANITIZER:REMOVED]";
				}
			}
		});
	}
	return entryHeaders;
}

export function hashRemovePostQueryParams(
	postDataParams: HarParam[],
	selectedPostData: Record<string, boolean>,
	isHashEnabled: boolean
): HarParam[] {
	//var postDataParams = harcontent.log.entries[63].request.postData.params;
	for (let postDataValue in postDataParams) {
		Object.entries(selectedPostData).map(
			([item, status]: [string, boolean]) => {
				if (postDataParams[postDataValue].name == item && status) {
					if (postDataParams[postDataValue].name == "code") {
						postDataParams[postDataValue].value =
							" Hashed:" + hashValue(postDataParams[postDataValue].value);
					} else if (postDataParams[postDataValue].name == "SAMLRequest") {
						const signatureRemovedSamlAssertion =
							getSignatureRemovedSamlAssertion(
								postDataParams[postDataValue].value
							).toString();
						postDataParams[postDataValue].value =
							"signatureValueRemoved:" + signatureRemovedSamlAssertion;
					} else if (isHashEnabled) {
						postDataParams[postDataValue].value =
							" Hashed:" + hashValue(postDataParams[postDataValue].value);
					}
				}
			}
		);
	}
	return postDataParams;
}

export function hashRemoveQueryStringparams<T>(
	queryStringParams: HarParam[],
	selectedQueryStringParams: Record<string, boolean>,
	isHashEnabled: boolean
): HarParam[] {
	for (let queryStringParamName in queryStringParams) {
		Object.entries(selectedQueryStringParams).map(
			([item, status]: [string, boolean]) => {
				if (queryStringParams[queryStringParamName].name == item && status) {
					if (queryStringParams[queryStringParamName].name == "code") {
						queryStringParams[queryStringParamName].value =
							" Hashed: " +
							hashValue(queryStringParams[queryStringParamName].value);
					} else if (
						queryStringParams[queryStringParamName].name == "id_token_hint"
					) {
						queryStringParams[queryStringParamName].value =
							"Signature Removed:" +
							queryStringParams[queryStringParamName].value.substring(
								0,
								queryStringParams[queryStringParamName].value.lastIndexOf(".")
							);
					} else if (isHashEnabled) {
						queryStringParams[queryStringParamName].value =
							" Hashed: " +
							hashValue(queryStringParams[queryStringParamName].value);
					} else {
						queryStringParams[queryStringParamName].value = "[HAR_SANITIZER:REMOVED]"
					}
				}
			}
		);
	}
	return queryStringParams;
}

export const hashRemoveUrlParams = (
	url: string,
	selectedPostData: Record<string, boolean>,
	isHashEnabled: boolean
) => {
	var baseurl = url.substring(0, url.indexOf("?"));
	var urlparams = url
		.substring(url.indexOf("?") + 1, url.length)
		.split("&");
	for (let urlparam in urlparams) {
		let props = urlparams[urlparam].split("=");
		Object.entries(selectedPostData).map(
			([item, status]: [string, boolean]) => {
				if (props[0] == item && status) {
					if (props[0] == "id_token_hint") {
						const token = props[1];
						// console.log(token);
						if (token.includes(".")) {
							props[1] =
								"Signature Removed:" +
								token.substring(0, token.lastIndexOf("."));
						}
					} else if (isHashEnabled) {
						props[1] = "Hashed:" + hashValue(props[1]);
					}
					urlparams[urlparam] = props.join("=");
				}
			}
		);
	}
	url = baseurl + "?" + urlparams.join("&");
	return url;
};
