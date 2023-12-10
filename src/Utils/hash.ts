import sha256 from "fast-sha256";
import { getSignatureRemovedSamlAssertion } from "./decoder";
import {DescriptionConstant, SanitizePropertyConstant, UtilConstant } from "./Constants";
import { SanitizeState } from "./SanitizeTypes";

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
				let hashed = hashValue(entryCookies[cookieName].value);
				entryCookies[cookieName].value = DescriptionConstant.HASHED + hashed;
			}
		});
	}
	return entryCookies;
}

export function hashRemoveHeaders<T>(
	entryHeaders: any,
	selectedValues: SanitizeState,
	hashEnabled: boolean,
	removalEnabled: boolean
): any[] {

	for (let headerName in entryHeaders) {
		Object.entries(selectedValues.headers.sanitizeList).map(([item, status]: [string, boolean]) => {
			if (entryHeaders[headerName].name == item && status) {
				if (
					entryHeaders[headerName].name == SanitizePropertyConstant.COOKIE ||
					entryHeaders[headerName].name == SanitizePropertyConstant.SET_COOKIE
				) {
					const array = entryHeaders[headerName].value.split(";");
					for (let i in array) {
						const array1 = array[i].split(/=(.*)/, 2);
						array1[1] = hashValue(array1[1]);
						array[i] = array1.join(DescriptionConstant.HASHED);
					}
					const hashedValues = array.join(";");
					entryHeaders[headerName].value = hashedValues;
				} else if (entryHeaders[headerName].name == SanitizePropertyConstant.AUTHORIZATION) {
					const authorizationValue = entryHeaders[headerName].value.split(" ");
					const token = authorizationValue[1];
					if (token.includes(".")) {
						authorizationValue[1] = token.substring(0, token.lastIndexOf("."));
						entryHeaders[headerName].value =
							authorizationValue.join(DescriptionConstant.SIGNATURE_VALUE_REMOVED);
					} else {
						authorizationValue[1] = hashValue(token);
						entryHeaders[headerName].value =
							authorizationValue.join(DescriptionConstant.HASHED);
					}
				} else if (entryHeaders[headerName].name == SanitizePropertyConstant.LOCATION ||
				SanitizePropertyConstant.REFERER) {
					entryHeaders[headerName].value = hashRemoveUrlParams(entryHeaders[headerName].value,
						selectedValues.queryStringParams.sanitizeList,
						selectedValues.queryStringParams.sanitizeOption.hashEnabled,
						selectedValues.queryStringParams.sanitizeOption.removalEnabled);
				}
				if (hashEnabled && (entryHeaders[headerName].name != SanitizePropertyConstant.COOKIE ||
				SanitizePropertyConstant.SET_COOKIE|| SanitizePropertyConstant.AUTHORIZATION ||
				SanitizePropertyConstant.LOCATION)) {
					const hashedValue = hashValue(entryHeaders[headerName].value);
					entryHeaders[headerName].value = DescriptionConstant.HASHED + hashedValue;

				} else if (removalEnabled && (entryHeaders[headerName].name != SanitizePropertyConstant.COOKIE || 
					SanitizePropertyConstant.SET_COOKIE|| SanitizePropertyConstant.AUTHORIZATION ||
					SanitizePropertyConstant.LOCATION)) {
					entryHeaders[headerName].value = DescriptionConstant.SANITIZER_REMOVED_VALUE;
				}
			}
		});
	}
	return entryHeaders;
}

export function hashRemovePostQueryParams(
	postDataParams: HarParam[],
	selectedPostData: Record<string, boolean>,
	isHashEnabled: boolean,
	isRemovalEnabled: boolean
): HarParam[] {

	for (let postDataValue in postDataParams) {
		Object.entries(selectedPostData).map(
			([item, status]: [string, boolean]) => {
				if (postDataParams[postDataValue].name == item && status) {
					if (postDataParams[postDataValue].name == SanitizePropertyConstant.CODE) {
						postDataParams[postDataValue].value =
							DescriptionConstant.HASHED + hashValue(postDataParams[postDataValue].value);
					} else if(postDataParams[postDataValue].name == SanitizePropertyConstant.PASSWORD || 
						postDataParams[postDataValue].name.includes(SanitizePropertyConstant.PASS)) {
							postDataParams[postDataValue].value = DescriptionConstant.SANITIZER_REMOVED_VALUE
						console.log(postDataParams[postDataValue].value);
					} 
					else if (postDataParams[postDataValue].name == SanitizePropertyConstant.SAML_REQUEST 
						|| SanitizePropertyConstant.SAML_RESPONSE) {
							console.log(postDataParams[postDataValue]);
						const signatureRemovedSamlAssertion =
							getSignatureRemovedSamlAssertion(
								postDataParams[postDataValue].value
							).toString();
						postDataParams[postDataValue].value =
							DescriptionConstant.SIGNATURE_VALUE_REMOVED + signatureRemovedSamlAssertion;
					} else if (isHashEnabled && postDataParams[postDataValue].name != SanitizePropertyConstant.CODE 
						|| SanitizePropertyConstant.SAML_REQUEST || SanitizePropertyConstant.SAML_RESPONSE) {
						postDataParams[postDataValue].value =
							DescriptionConstant.HASHED + hashValue(postDataParams[postDataValue].value);
					} else if (isRemovalEnabled && postDataParams[postDataValue].name != SanitizePropertyConstant.CODE
						 || SanitizePropertyConstant.SAML_REQUEST || SanitizePropertyConstant.SAML_RESPONSE) {
						postDataParams[postDataValue].value = DescriptionConstant.SANITIZER_REMOVED_VALUE
						console.log(postDataParams[postDataValue].value);
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
	isHashEnabled: boolean,
	isRemovalEnabled: boolean
): HarParam[] {

	for (let queryStringParamName in queryStringParams) {
		Object.entries(selectedQueryStringParams).map(
			([item, status]: [string, boolean]) => {
				if (queryStringParams[queryStringParamName].name == item && status) {
					if (queryStringParams[queryStringParamName].name == SanitizePropertyConstant.CODE) {
						queryStringParams[queryStringParamName].value =
							DescriptionConstant.HASHED +
							hashValue(queryStringParams[queryStringParamName].value);
					} else if (
						queryStringParams[queryStringParamName].name == SanitizePropertyConstant.ID_TOKEN_HINT
					) {
						queryStringParams[queryStringParamName].value =
							DescriptionConstant.SIGNATURE_VALUE_REMOVED +
							queryStringParams[queryStringParamName].value.substring(
								0,
								queryStringParams[queryStringParamName].value.lastIndexOf(".")
							);
					}
					if (isHashEnabled && (queryStringParams[queryStringParamName].name != SanitizePropertyConstant.CODE 
						|| SanitizePropertyConstant.ID_TOKEN_HINT)) {
						queryStringParams[queryStringParamName].value = UtilConstant.HASH +
							hashValue(queryStringParams[queryStringParamName].value);
						// console.log(queryStringParams[queryStringParamName].value);
					} else if (isRemovalEnabled && (queryStringParams[queryStringParamName].name !=
					SanitizePropertyConstant.CODE || SanitizePropertyConstant.ID_TOKEN_HINT)) {
						queryStringParams[queryStringParamName].value =DescriptionConstant.SANITIZER_REMOVED_VALUE
						// console.log(queryStringParams[queryStringParamName].value);

					}
				}
			}
		);
	}
	return queryStringParams;
}

export const hashRemoveUrlParams = (
	url: string,
	selectedQueryStringParams: Record<string, boolean>,
	isHashEnabled: boolean,
	isRemovalEnabled: boolean
) => {
	console.log(url);
	if(url.includes("?")) {
		let baseurl = url.substring(0, url.indexOf("?"));
		console.log(baseurl)
		let urlparams = url
			.substring(url.indexOf("?") + 1, url.length)
			.split("&");
		console.log(urlparams)
		for (let urlparam in urlparams) {
			let props = urlparams[urlparam].split("=");
			Object.entries(selectedQueryStringParams).map(
				([item, status]: [string, boolean]) => {
					if (props[0] == item && status) {
						if (props[0] == SanitizePropertyConstant.ID_TOKEN_HINT) {
							const token = props[1];
							if (token.includes(".")) {
								props[1] =
									 DescriptionConstant.SIGNATURE_VALUE_REMOVED+
									token.substring(0, token.lastIndexOf("."));
							}
						}
						else if (props[0] == SanitizePropertyConstant.CODE) {
							props[1] = DescriptionConstant.HASHED + hashValue(props[1]);
						}
						if (isHashEnabled && (props[0] != SanitizePropertyConstant.ID_TOKEN_HINT ||
						SanitizePropertyConstant.CODE)) {
							props[1] = DescriptionConstant.HASHED + hashValue(props[1]);
						} else if (isRemovalEnabled && (props[0] != SanitizePropertyConstant.ID_TOKEN_HINT ||
						SanitizePropertyConstant.CODE)) {
							props[1] = DescriptionConstant.SANITIZER_REMOVED_VALUE;
						}
						urlparams[urlparam] = props.join("=");
					}
				}
			);
		}
		url = baseurl + "?" + urlparams.join("&");
	}
	return url;
};