export const mapHeading: Record<string, string> = {
    
	cookies: "Cookies",
	headers: "Headers",
	postData: "Post Body Params",
	queryStringParams: "Query String Parameters",
};

export const mapDefaultSanitizeList: Record<string, string> = {

	id_token_hint: "ID Token Hint:Token Signature removed",
	SAMLRequest: "SAML Request:Request Token Signature removed",
	SAMLResponse: "SAML Response:Response Token Signature removed",
	Authorization: "JWT Token:Token Signature removed",
	password: "Password:Removed",
	code: "Authorization Code:Code Hashed",
	Location: "Location:Sensitive information removed"
};