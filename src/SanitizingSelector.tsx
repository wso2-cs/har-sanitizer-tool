import { ElementRef, useRef, useState } from "react";
import { SanitizeState } from "./App";
import { Accordion } from 'flowbite-react';

type SanitizeSelectorProps = {
	sanitizeItems: SanitizeState;
	setSanitizeItems: (value: SanitizeState) => void;
	jsonHar: string | undefined;
};
const mapHeading: Record<string, string> = {
	cookies: "Cookies",
	headers: "Headers",
	postData: "Post Body Params",
	queryStringParams: "Query String Parameters",
};

const mapDefaultSanitizeList: Record<string, string> = {
	id_token_hint: "ID Token Hint:Token Signature removed",
	SAMLRequest: "SAML Request:Request Token Signature removed",
	SAMLResponse: "SAML Response:Response Token Signature removed",
	Authorization: "JWT Token:Token Signature removed",
	password: "Password:Removed",
	code: "Authorization Code:Code Hashed",
	Location: "Location:Sensitive information removed"
};

export const SanitizeSelector: React.FC<SanitizeSelectorProps> = ({
	sanitizeItems,
	setSanitizeItems,
	jsonHar
}) => {
	const [sanitizeCookies, setSanitizeCookies] = useState<boolean>(true);

	const retrieveHeading = (property: string, type: string) => {
		const propertyDesc = property.split(":");
		if (type == "Heading") {
			return propertyDesc[0];
		} else if (type == "SubHeading") {
			return propertyDesc[1];
		}
	}

	// This function will be triggered when a checkbox changes its state
	const handleCheckedSanitizeItem = (
		status: boolean,
		type: string,
		item: string,
		selectAllInput: HTMLInputElement,
		sanitizeCookies: boolean
	) => {
		const updatedSanitizeList = { ...sanitizeItems };
		const selectedParamList = { ...updatedSanitizeList[type].sanitizeList };
		if (type == "cookies" && sanitizeCookies) {
			setSanitizeCookies(false);
		}
		selectedParamList[item] = status;
		updatedSanitizeList[type].sanitizeList = selectedParamList;
		const values = Object.values(selectedParamList);
		selectAllInput.indeterminate =
			values.every((v) => v === true) && values.some((v) => v === true);
		setSanitizeItems(updatedSanitizeList);
	};

	const handleAllCheckboxChange = (type: string, status: boolean) => {
		const updatedSanitizeList = { ...sanitizeItems };
		const selectedParamList = { ...updatedSanitizeList[type].sanitizeList };
		Object.keys(selectedParamList).map(
			(item) => (selectedParamList[item] = status)
		);
		updatedSanitizeList[type].sanitizeList = selectedParamList;
		setSanitizeItems(updatedSanitizeList);
	};

	const printUpdated = () => {
		console.log(sanitizeItems);
		return <div></div>;
	};
	const handleSanitizeOption = (e: any) => {
		const { name, value } = e.target;
		if (value == "hash") {
			sanitizeItems[name].sanitizeOption.hashEnabled = true;
			sanitizeItems[name].sanitizeOption.removalEnabled = false;
		} else if (value == "remove") {
			sanitizeItems[name].sanitizeOption.removalEnabled = true;
			sanitizeItems[name].sanitizeOption.hashEnabled = false;
		}
	};

	const handleSanitizeByDefault = (
		status: boolean,
		type: string,
		item: string,
		selectAllInput: HTMLInputElement
	) => {
		const updatedSanitizeList = { ...sanitizeItems };
		const selectedParamList = { ...updatedSanitizeList[type].sanitizeList };
		const selectedCookieParamList = { ...updatedSanitizeList["cookies"].sanitizeList };
		if (item.toLowerCase() == "set-cookie") {
			selectedParamList[item] = status;
			selectedParamList["Cookie"] = status;
			Object.keys(selectedCookieParamList).map(
				(item) => (selectedCookieParamList[item] = status)
			);
			updatedSanitizeList[type].sanitizeList = selectedParamList;
			updatedSanitizeList["cookies"].sanitizeList = selectedCookieParamList;
			const values = Object.values(selectedCookieParamList);

			selectAllInput.indeterminate =
				values.every((v) => v === true) && values.some((v) => v === true);
			setSanitizeCookies(status);

		}
		selectedParamList[item] = status;
		updatedSanitizeList[type].sanitizeList = selectedParamList;
		setSanitizeItems(updatedSanitizeList);
	};

	const renderDefaultSanitizeProperties = (sanitizeList: SanitizeState) => {
		const uniqueDefParamList: any[] = [];
		return Object.keys(sanitizeList).map(type => {
			const items = sanitizeItems[type].sanitizeList;
			const size = Object.keys(items).length;
			if (size) {
				return Object.entries(items).map(
					([item, status]: [string, boolean]) => {
						const paramKeys = Object.keys(
							mapDefaultSanitizeList
						);
						const cookie = item.toLowerCase().includes("set-cookie");

						if (!uniqueDefParamList.includes(item) && paramKeys.includes(item)) {
							uniqueDefParamList.push(item);
							return (<><div className="flex items-center space-x-3 rtl:space-x-reverse">
								<div className="ml-6 mb-2">
									<input
										type="checkbox"
										checked={status}
										className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded 
												focus:ring-blue-900 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
												focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										onChange={() => {
											const selectAll = ref.current?.querySelector(
												`#${`all-${type}`}`
											);
											if (selectAll instanceof HTMLInputElement) {
												handleSanitizeByDefault(
													!status,
													type,
													item,
													selectAll
												);
											}
										}}
									/>
									<label className="ms-2 text-sm font-normal text-gray-900 dark:text-gray-300" key={item}>
										{retrieveHeading(mapDefaultSanitizeList[item], "Heading")}
									</label><br />
									<p className="text-xs font-normal text-gray-500 dark:text-gray-300 ml-6">
										{retrieveHeading(mapDefaultSanitizeList[item], "SubHeading")}
									</p>

								</div>
							</div></>)
						} else if (cookie) {
							return (<><div className="flex items-center space-x-3 rtl:space-x-reverse">
								<div className="ml-6 mb-2">
									<input
										type="checkbox"
										checked={sanitizeCookies}
										className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded 
												focus:ring-blue-900 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
												focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										onChange={() => {
											const selectAll = ref.current?.querySelector(
												`#${`all-cookies`}`
											);
											if (selectAll instanceof HTMLInputElement) {
												handleSanitizeByDefault(
													!sanitizeCookies,
													type,
													item,
													selectAll
												);
											}
										}
										}

									/>
									<label className="ms-2 text-sm font-normal text-gray-900 dark:text-gray-300" key={item}>
										Cookies
									</label><br />
									<p className="text-xs font-normal text-gray-500 dark:text-gray-300 ml-6">
										All Cookies Hashed
									</p>
								</div>
							</div></>)
						}

					})
			}
		});
	}

	const ref = useRef<ElementRef<"div">>(null);
	let selectAllValues = `all`;
	return (
		<div ref={ref}>
			<div>
				{jsonHar ? (
					<>
						<p className="mb-3 text-gray-700 dark:text-gray-700 ml-4 mt-3 mr-2 text-sm whitespace-pre-line">
							The following properties are sanitized by default for effective removal of sensitive information. <br />
						</p>

						<div className="space-y-1 columns-1 lg:columns-2 xl:columns-3 px-2 ml-4 mr-4 pb-2 pt-2">
							<div className="max-w-md space-y-1 text-gray-700 text-sm dark:text-gray-400">
								{renderDefaultSanitizeProperties(sanitizeItems)}

							</div>
						</div>
						<h3 className="text-2xl font-bold ml-4 mt-3">
							Advanced Configuration
						</h3>
					</>
				) : (
					""
				)}
			</div>

			{Object.keys(sanitizeItems).map((type) => {
				const items = sanitizeItems[type].sanitizeList;
				const selectedSanitizeOption = sanitizeItems[type].sanitizeOption;
				selectAllValues = `all-${type}`;
				const size = Object.keys(items).length;
				if (size) {
					return (
						<>
							<Accordion collapseAll className="m-4">
								<Accordion.Panel isOpen={true}>
									<Accordion.Title>
										<h1 className="font-semibold text-gray-800 dark:text-gray-400">{mapHeading[type]}</h1>

										<h2 className="text-xs font-normal text-gray-500 dark:text-gray-300">Click here to view advanced configuration </h2></Accordion.Title>

									<Accordion.Content>
										<div className="flex ml-4">
											<span className="my-4 ml-2 text-sm text-gray-500">
												Select preferred sanitizing method:
											</span>
											<div className="flex items-center me-4 ml-4">
												<input
													id="inline-radio"
													type="radio"
													value="hash"
													defaultChecked={selectedSanitizeOption.hashEnabled}
													name={type}
													className="w-4 h-4 text-blue-900 bg-gray-100 
                                        border-gray-300 focus:ring-blue-900 dark:focus:ring-blue-900 dark:ring-offset-gray-800 focus:ring-2 
										dark:bg-gray-700 dark:border-gray-600"
													onChange={handleSanitizeOption}
												/>
												<label
													htmlFor="inline-radio"
													className="ms-2 text-xs font-normal text-gray-800 dark:text-gray-300"
												>
													Hash
												</label>
											</div>
											<div className="flex items-center me-4">
												<input
													id="inline-radio"
													type="radio"
													value="remove"
													defaultChecked={selectedSanitizeOption.removalEnabled}
													name={type}
													className="w-4 h-4 text-blue-900 bg-gray-100 
                                        border-gray-300 focus:ring-blue-900 dark:focus:ring-blue-900 dark:ring-offset-gray-800 focus:ring-2 
										dark:bg-gray-700 dark:border-gray-600"
													onChange={handleSanitizeOption}
												/>
												<label
													htmlFor="inline-radio"
													className="ms-2 text-xs font-normal text-gray-800 dark:text-gray-300"
												>
													Remove
												</label>
											</div>
										</div>
										<div className="ml-6 mb-2">
											<input
												id={selectAllValues}
												type="checkbox"
												checked={Object.keys(items).every((k) => items[k])}
												className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded 
                                                focus:ring-blue-900 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                                                focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
												onChange={(e) => {
													handleAllCheckboxChange(type, e.target.checked);
												}}
											/>
											<label className="text-base font-medium text-gray-900 ml-2">
												Sanatize all
											</label>
										</div>
										<div
											key={type}
											className="space-y-1 columns-1 lg:columns-2 xl:columns-3 px-2 ml-4 mr-4 pb-2 pt-2 shadow-inner"
										>
											{Object.entries(items).map(
												([item, status]: [string, boolean]) => {
													const paramKeys = Object.keys(
														mapDefaultSanitizeList
													);
													const cookie = item.toLowerCase().includes("cookie");

													if (!paramKeys.includes(item) || cookie) {

														return (
															<div key={item}>
																<input
																	type="checkbox"
																	checked={status}
																	className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded 
													focus:ring-blue-900 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
													focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
																	onChange={() => {
																		const selectAll = ref.current?.querySelector(
																			`#${selectAllValues}`
																		);
																		if (selectAll instanceof HTMLInputElement) {
																			handleCheckedSanitizeItem(
																				!status,
																				type,
																				item,
																				selectAll,
																				sanitizeCookies
																			);
																		}
																	}}
																></input>
																<label
																	htmlFor="default-checkbox"
																	className="ms-2 text-sm font-normal text-gray-900 dark:text-gray-300"
																>
																	{item}
																</label>
															</div>
														);
													}
												}
											)}
										</div>
									</Accordion.Content>
								</Accordion.Panel>
							</Accordion>
						</>
					);
				}
			})}
			<div
				key="footer"
				className="mt-10 ml-4 mr-10 text-gray-500 dark:text-gray-400 mb-10"
			>
				<div>
					<h1 className="text-2xl font-bold mt-5 text-gray-700">
						Introducing the <span className="text-orange-500 dark:text-blue-500">HAR File Sanitizer Tool </span>
						- Secure Troubleshooting Made Easy for Web-Related Issues!
					</h1>
					<p className="mt-2 dark:text-gray-400">
						When you encounter issues with websites, providing network traces becomes crucial for troubleshooting.
						However, these traces might contain sensitive info like passwords and API keys, posing security risks.
						The HAR Sanitizer tool sanitizes sensitive data providing the capability to hash or remove entirely from your network traces,
						ensuring your session cookies, authorization headers, and more stay private.
						It works using client-side logic to sanitize HAR files, allowing you to share troubleshooting data without compromising security.
						Embrace a worry-free online experience with our commitment to building a safer Digital Realm!
					</p>
				</div>
			</div>
			<div>{printUpdated()}</div>
		</div>
	);
};