import { ElementRef, useRef } from "react";
import { SanitizeState } from "./App";

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

const mapDefaulSignatureRemovalList: Record<string, string> = {
	id_token_hint: "ID Token Hint",
	SAMLRequest: "SAML Request",
	SAMLResponse: "SAML Response",
	jwt_token: "JWT Token",
};

export const SanitizeSelector: React.FC<SanitizeSelectorProps> = ({
	sanitizeItems,
	setSanitizeItems,
	jsonHar,
}) => {
	// This function will be triggered when a checkbox changes its state
	const handleCheckedSanitizeItem = (
		status: boolean,
		type: string,
		item: string,
		selectAllInput: HTMLInputElement
	) => {
		const items = sanitizeItems[type];
		const updatedSanitizeList = { ...sanitizeItems };
		const selectedParamList = { ...updatedSanitizeList[type].sanitizeList };
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

	const ref = useRef<ElementRef<"div">>(null);

	return (
		<div ref={ref}>
			<div>
				{jsonHar ? (
					<>
						<p className="mb-3 text-gray-700 dark:text-gray-700 ml-4 mt-3 text-sm whitespace-pre-line">
							Please note that the signature is removed from the below params
							for effective removal of sensitive information. <br />
							Authorization Bearer Headers using JWT Tokens as Access Tokens is
							included with signature removed by default.
						</p>
						<div className="columns-1 px-2 ml-4 mr-4 pb-2">
							<ul className="max-w-md space-y-1 text-gray-700 text-sm list-none list-inside dark:text-gray-400">
								{Object.entries(mapDefaulSignatureRemovalList).map(
									([param, value]: [string, string]) => {
										return (
											<li className="flex items-center space-x-3 rtl:space-x-reverse">
												<svg
													className="flex-shrink-0 w-3.5 h-3.5 text-blue-800 dark:text-blue-800"
													aria-hidden="true"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 16 12"
												>
													<path
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M1 5.917 5.724 10.5 15 1.5"
													/>
												</svg>
												<span key={param}>{value}</span>
											</li>
										);
									}
								)}
							</ul>
						</div>
					</>
				) : (
					""
				)}
			</div>
			{Object.keys(sanitizeItems).map((type) => {
				const items = sanitizeItems[type].sanitizeList;
				const selectedSanitizeOption = sanitizeItems[type].sanitizeOption;
				const size = Object.keys(items).length;
				const selectAllValues = `all-${type}`;
				if (size) {
					return (
						<>
							<h3 className="text-2xl font-bold ml-4 mt-3">
								{mapHeading[type]}
							</h3>
							<div className="flex ml-4">
								<span className="my-4 text-sm text-gray-500">
									Select preferred Sanitizing method:
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
											mapDefaulSignatureRemovalList
										);
										if (!paramKeys.includes(item)) {
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
																	selectAll
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
						</>
					);
				}
			})}
			<div
				key="footer"
				className="mt-10 ml-8 mr-10 text-gray-500 dark:text-gray-400 mb-10"
			>
				<div>
					<h3 className="font-bold mt-5 text-gray-700">
						Best Practices for Sharing Network Traces{" "}
					</h3>
					<p className="mt-2  dark:text-gray-400">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
						bibendum hendrerit varius. Maecenas lorem tellus, viverra quis
						sapien vel, consequat ornare lectus. Donec ut nunc mauris. Donec
						elementum enim vel viverra sagittis. Praesent placerat ac nunc sit
						amet interdum. Mauris aliquet urna metus, nec tempus eros efficitur
						sed. Morbi tincidunt enim ac leo interdum, at porta purus consequat.
						Sed lacus ex, ultrices eu vulputate vitae, efficitur eu enim. Fusce
						tincidunt, nisl et lobortis tempor, orci nulla consequat ligula,
						quis bibendum purus ex quis sem. Aenean metus ante, rhoncus aliquam
						diam quis, condimentum volutpat mi. Vestibulum blandit tristique
						velit a pellentesque.
					</p>
				</div>
			</div>
			<div>{printUpdated()}</div>
		</div>
	);
};
