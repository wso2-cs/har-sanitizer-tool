import { ElementRef, useRef, useState } from "react";
import { Accordion } from 'flowbite-react';
import { SanitizeState } from "./Utils/SanitizeTypes";
import { mapDefaultSanitizeList, mapHeading } from "./Utils/Mapper";
import { DescriptionConstant, SanitizePropertyConstant, UtilConstant } from "./Utils/Constants";
import { About } from "./About";

type SanitizeSelectorProps = {
	sanitizeItems: SanitizeState;
	setSanitizeItems: (value: SanitizeState) => void;
	jsonHar: string;
};

export const SanitizeSelector: React.FC<SanitizeSelectorProps> = ({
	sanitizeItems,
	setSanitizeItems,
	jsonHar
}) => {

	const [sanitizeCookies, setSanitizeCookies] = useState<boolean>(true);

	const retrieveHeading = (property: string, type: string) => {

		const propertyDesc = property.split(":");
		if (type == DescriptionConstant.HEADING) {
			return propertyDesc[0];
		} else if (type == DescriptionConstant.SUB_HEADING) {
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
		if (type == DescriptionConstant.COOKIES || item == SanitizePropertyConstant.COOKIE || 
			item == SanitizePropertyConstant.SET_COOKIE && sanitizeCookies) {
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
		if (value == UtilConstant.HASH) {
			sanitizeItems[name].sanitizeOption.hashEnabled = true;
			sanitizeItems[name].sanitizeOption.removalEnabled = false;
		} else if (value == UtilConstant.REMOVE) {
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
		const selectedCookieParamList = { ...updatedSanitizeList[DescriptionConstant.COOKIES].sanitizeList };

		if (item.toLowerCase() == DescriptionConstant.SET_COOKIE_LOWER) {
			selectedParamList[item] = status;
			selectedParamList[SanitizePropertyConstant.COOKIE] = status;
			Object.keys(selectedCookieParamList).map(
				(item) => (selectedCookieParamList[item] = status)
			);

			updatedSanitizeList[type].sanitizeList = selectedParamList;
			updatedSanitizeList[DescriptionConstant.COOKIES].sanitizeList = selectedCookieParamList;
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
						const cookie = item.toLowerCase().includes(DescriptionConstant.SET_COOKIE_LOWER);

						if (!uniqueDefParamList.includes(item) && paramKeys.includes(item)) {
							uniqueDefParamList.push(item);
							return (<div className="flex items-center space-x-3 rtl:space-x-reverse" key={item + `property`}>
								<div className="ml-6 mb-2">
									<input
										key={item + `checkbox`}
										type="checkbox"
										checked={status}
										className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded 
												focus:ring-blue-900 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
												focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										onChange={() => {
											const selectAll = ref.current?.querySelector(
												`#${`${UtilConstant.ALL}-${type}`}`
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
										{retrieveHeading(mapDefaultSanitizeList[item], DescriptionConstant.HEADING)}
									</label><br />
									<p className="text-xs font-normal text-gray-500 dark:text-gray-300 ml-6">
										{retrieveHeading(mapDefaultSanitizeList[item], DescriptionConstant.SUB_HEADING)}
									</p>

								</div>
							</div>)
						} else if (cookie) {
							return (<div className="flex items-center space-x-3 rtl:space-x-reverse"  key ={`sanitize-all-cookies`}>
								<div className="ml-6 mb-2">
									<input
										
										type="checkbox"
										checked={sanitizeCookies}
										className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded 
												focus:ring-blue-900 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
												focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										onChange={() => {
											const selectAll = ref.current?.querySelector(
												`#${UtilConstant.ALL_COOKIES}`
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
							</div>)
						}
					}
				)
			}
		});
	}

	const ref = useRef<ElementRef<"div">>(null);
	let selectAllValues = UtilConstant.ALL;
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
				selectAllValues = `${UtilConstant.ALL}-${type}`;
				const size = Object.keys(items).length;

				if (size) {
					return (
						<div key={type}>
							<Accordion collapseAll className="m-4">
								<Accordion.Panel>
									<Accordion.Title>
										<div className="font-semibold text-gray-800 dark:text-gray-400">{mapHeading[type]}</div>
										<div className="text-xs font-normal text-gray-500 dark:text-gray-300">
										    Click here to view advanced configuration </div>
									</Accordion.Title>

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
										<div className="ml-6 mb-2" key={selectAllValues+`checkbox`}>
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
													const cookie = item.toLowerCase().includes(SanitizePropertyConstant.COOKIE);

													if (!paramKeys.includes(item) || cookie) {

														return (
															<div key={item +`property`}>
																<input key={item}
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
						</div>
					);
				}
			})}
			<About/>
			<div>{printUpdated()}</div>
		</div>
	);
};