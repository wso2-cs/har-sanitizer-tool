import "./App.css";
import { useState } from "react";
import { FileInput } from "flowbite-react";
import * as HashUtils from "./Utils/hash";
import { removeCookies, removeHashSensitiveInfoText } from "./Utils/removeInfo";
import { HarParam } from "./Utils/hash";
import { SanitizeSelector } from "./SanitizingSelector";

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
];

export const defaultSelectedSanitizeList = [...defaultSensitiveInfoList];

function App() {
	const fileReader = new FileReader();
	const [jsonHar, setJsonHar] = useState<string>();
	const [downloadJsonHar, setdownloadJsonHarJsonHar] = useState<any>();

	const [sanitizeTypeStatus, setSanitizeTypeStatus] =
		useState<SanitizeOption>();

	const [harError, setHarError] = useState<string>("");

	const defaultSanitizeList: SanitizeState = {
		cookies: {
			sanitizeOption: { hashEnabled: true, removalEnabled: false },
			sanitizeList: {},
		},
		headers: {
			sanitizeOption: { hashEnabled: true, removalEnabled: false },
			sanitizeList: {},
		},
		postData: {
			sanitizeOption: { hashEnabled: false, removalEnabled: true },
			sanitizeList: {},
		},
		queryStringParams: {
			sanitizeOption: { hashEnabled: false, removalEnabled: true },
			sanitizeList: {},
		},
	};

	const [sanitizeList, setSanitizeList] =
		useState<SanitizeState>(defaultSanitizeList);

	const handleFileChosen = (file: any) => {
		fileReader.onloadend = handleFileRead;
		fileReader.readAsText(file);
	};

	const handleFileRead = (e: any) => {
		try {
			const content = fileReader.result;
			console.log(content);
			if (
				content &&
				(typeof content === "string" || content instanceof String)
			) {
				var harcontent = JSON.parse(content as string);
				setdownloadJsonHarJsonHar(harcontent);
				setSanitizeList(getSanitizeItems(harcontent));
				setJsonHar(JSON.stringify(harcontent));
				setHarError("");
				return;
			}
			throw new Error("File Upload failed");
		} catch (e) {
			console.log(e);
			setHarError(`Invalid har file: ${e?.toString()}`);
		}
	};

	function getHarParamsArr(harcontent: any) {
		const harParamsArr = {
			headers: new Set<string>(),
			queryStringParams: new Set<string>(),
			cookies: new Set<string>(),
			postData: new Set<string>(),
		};

		const entries = harcontent.log.entries;
		for (let i in entries) {
			let request = entries[i].request;
			request.headers.map((header: HarParam) =>
				harParamsArr.headers.add(header.name)
			);
			request.cookies.map((cookie: HarParam) =>
				harParamsArr.cookies.add(cookie.name)
			);
			if (request.postData) {
				request.postData.params.map((postData: HarParam) =>
					harParamsArr.postData.add(postData.name)
				);
			}
			if (request.queryString.length != 0) {
				request.queryString.map((queryString: HarParam) =>
					harParamsArr.queryStringParams.add(queryString.name)
				);
			}

			let response = entries[i].response;
			response.headers.map((header: HarParam) =>
				harParamsArr.headers.add(header.name)
			);
			response.cookies.map((cookie: HarParam) =>
				harParamsArr.cookies.add(cookie.name)
			);
		}

		return {
			headers: [...harParamsArr.headers].sort(),
			queryStringParams: [...harParamsArr.queryStringParams].sort(),
			cookies: [...harParamsArr.cookies].sort(),
			postData: [...harParamsArr.postData].sort(),
		};
	}

	function getSanitizeItems(harcontent: string): SanitizeState {
		const sanitizeItems = getHarParamsArr(harcontent);
		const output = { ...defaultSanitizeList };
		Object.entries(sanitizeItems).map(([key, items]: [string, string[]]) => {
			output[key].sanitizeList = items.reduce((acc, curr) => {
				if (!curr) return acc;
				acc[curr] = defaultSelectedSanitizeList.includes(curr);
				return acc;
			}, {} as Record<string, boolean>);
		});
		return output;
	}

	const sanitizeSensitiveInfo = (harcontent: any) => {
		let sanitizedOutput = getSanitizeItems(harcontent);
		console.log(sanitizedOutput);
		const entries = harcontent.log.entries;
		const pages = harcontent.log.pages;

		for (let entry in entries) {
			let request = entries[entry].request;
			let response = entries[entry].response;

			let sanitizedReqCookies;
			let sanitizedReqHeaders;
			let sanitizedReqpostDataText;
			let sanitizedReqPostDataParams;
			let sanitizedQueryStringCodeParam;
			let sanitizedRespHeaders;
			let sanitizedRespCookies;

			sanitizedReqHeaders = HashUtils.hashRemoveHeaders(
				request.headers,
				sanitizeList.headers.sanitizeList,
				sanitizeList.headers.sanitizeOption.hashEnabled
			);

			sanitizedRespHeaders = HashUtils.hashRemoveHeaders(
				response.headers,
				sanitizeList.headers.sanitizeList,
				sanitizeList.headers.sanitizeOption.hashEnabled
			);

			if (sanitizeList.cookies.sanitizeOption.hashEnabled) {
				sanitizedReqCookies = HashUtils.hashCookies(
					request.cookies,
					sanitizeList.cookies.sanitizeList
				);
				sanitizedRespCookies = HashUtils.hashCookies(
					response.cookies,
					sanitizeList.cookies.sanitizeList
				);
			} else {
				sanitizedReqCookies = removeCookies(
					request.cookies,
					sanitizeList.cookies.sanitizeList
				);
				sanitizedRespCookies = removeCookies(
					response.cookies,
					sanitizeList.cookies.sanitizeList
				);
			}
			request.cookies = sanitizedReqCookies;
			response.cookies = sanitizedRespCookies;
			request.headers = sanitizedReqHeaders;
			response.headers = sanitizedRespHeaders;

			if (request.postData) {
				sanitizedReqpostDataText = removeHashSensitiveInfoText(
					request.postData.text,
					sanitizeList.postData.sanitizeList,
					sanitizeList.postData.sanitizeOption.removalEnabled
				);

				sanitizedReqPostDataParams = HashUtils.hashRemovePostQueryParams(
					request.postData.params,
					sanitizeList.postData.sanitizeList,
					sanitizeList.postData.sanitizeOption.hashEnabled
				);

				request.postData.text = sanitizedReqpostDataText;
				request.postData.params = sanitizedReqPostDataParams;
			}

			if (request.queryString.length != 0) {
				sanitizedQueryStringCodeParam = HashUtils.hashRemovePostQueryParams(
					request.queryString,
					sanitizeList.queryStringParams.sanitizeList,
					sanitizeList.queryStringParams.sanitizeOption.hashEnabled
				);
				request.queryString = sanitizedQueryStringCodeParam;
			}

			if (request.url.includes("id_token_hint")) {
				const sanitizedReqUrlWithIDToken = HashUtils.hashRemoveUrlParams(
					request.url,
					sanitizeList.queryStringParams.sanitizeList,
					sanitizeList.queryStringParams.sanitizeOption.hashEnabled
				);
				request.url = sanitizedReqUrlWithIDToken;
			}
		}
		for (let i in pages) {
			if (pages[i].title.includes("id_token_hint")) {
				const sanitizedIDtokenPageTitle = HashUtils.hashRemoveUrlParams(
					pages[i].title,
					sanitizeList.queryStringParams.sanitizeList,
					sanitizeList.queryStringParams.sanitizeOption.hashEnabled
				);
				pages[i].title = sanitizedIDtokenPageTitle;
			}
		}

		harcontent.log.entries = entries;
		harcontent.log.pages = pages;
		setdownloadJsonHarJsonHar(harcontent);
		return harcontent;
	};

	const downloadTxtFile = () => {
		var sanitizedHarContent;
		sanitizeSensitiveInfo(downloadJsonHar);
		sanitizedHarContent = JSON.stringify(downloadJsonHar);
		const element = document.createElement("a");
		const file = new Blob([sanitizedHarContent as string], {
			type: "application/json",
		});
		element.href = URL.createObjectURL(file);
		element.download = "myFile.har";
		document.body.appendChild(element);
		element.click();
		// clean up "a" element & remove ObjectURL
		document.body.removeChild(element);
		URL.revokeObjectURL(element.href);
	};

	return (
		<div>
			<div className="title-sanitizer">
				<img src={require("./resources/wso2logo.png")} alt="" />
				<h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
					HAR File Sanitizer
				</h1>
			</div>
			<div className="flex flex-col max-w-2xl mx-auto">
				<div id="fileUpload">
					<FileInput
						id="file"
						helperText="Upload the HAR File for sanitization"
						onChange={(e) =>
							handleFileChosen(
								e.target.files instanceof FileList
									? e.target.files[0]
									: harError
							)
						}
					/>
					{harError && (
						<p className="mt-2 text-sm text-red-600 dark:text-red-500">
							{harError}
						</p>
					)}
				</div>
				<div className="self-end">
					{jsonHar ? (
						<button
							type="button"
							className="object-right text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 
              focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 
              dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
							onClick={(e) => downloadTxtFile()}
						>
							Download
						</button>
					) : null}
				</div>
			</div>
			<div>
				<SanitizeSelector
					sanitizeItems={sanitizeList}
					setSanitizeItems={setSanitizeList}
					jsonHar={jsonHar}
				></SanitizeSelector>
			</div>
		</div>
	);
}

export default App;
