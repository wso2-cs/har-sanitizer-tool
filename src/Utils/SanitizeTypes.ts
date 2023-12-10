export interface SanitizeOption {
	hashEnabled: boolean;
	removalEnabled: boolean;
}

export type SanitizeState = Record<
	string,
	{ sanitizeOption: SanitizeOption; sanitizeList: Record<string, boolean> }
>;

export const defaultSensitiveInfoList = [
	"Authorization",
	"access_token",
	"appID",
	"assertion",
	"code",
	"email",
	"id_token",
	"password",
	"commonAuthId",
	"opbs",
	"JSESSIONID",
	"Set-Cookie",
	"Cookie",
	"id_token_hint",
	"SAMLRequest",
	"SAMLResponse",
	"Location"
];

export const defaultSelectedSanitizeList = [...defaultSensitiveInfoList];