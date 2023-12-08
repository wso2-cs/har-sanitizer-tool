const decodeValue = (encodeValue: string) => {
	const uridecodedValue = decodeURIComponent(encodeValue);
	return atob(uridecodedValue);
}

const uriEncodeValue = (samlSignatureRemovedValue: string) => {
	const encodedValue = btoa(samlSignatureRemovedValue);
	return encodeURIComponent(encodedValue);
}

const removeSAMLSign = (samlAssertion: string): string => {
	const signatureValueStart = "<ds:SignatureValue>";
	const signatureValueEnd = "</ds:SignatureValue>";
	const decodedValue = decodeValue(samlAssertion);
	const removeSAMLSignature = decodedValue.substring(0, decodedValue.indexOf(signatureValueStart))
		+ decodedValue.substring(decodedValue.indexOf(signatureValueEnd) + signatureValueEnd.length, decodedValue.length);
	return removeSAMLSignature;
}

export const getSignatureRemovedSamlAssertion = (samlAssertion: string): string => {
	const samlSignatureRemovedValue = removeSAMLSign(samlAssertion);
	const encodedSignRemovedSAML = uriEncodeValue(samlSignatureRemovedValue);
	return encodedSignRemovedSAML;
}