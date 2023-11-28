import { ElementRef, useRef, useState } from "react";
import { SanitizeState } from "./App";

type SanitizeSelectorProps = {
	sanitizeItems: SanitizeState;
	setSanitizeItems: (value: SanitizeState) => void;
};
const mapHeading: Record<string, string> = {
	cookies: "Cookies",
	headers: "Headers",
	postData: "Post Body Params",
	queryStringParams: "Query String Parameters",
};

export const SanitizeSelector: React.FC<SanitizeSelectorProps> = ({
	sanitizeItems,
	setSanitizeItems,
}) => {
    // This function will be triggered when a checkbox changes its state
    const handleCheckedSanitizeItem = (status:boolean, type: string,
        item: string, selectAllInput: HTMLInputElement) => {
        
        console.log(status + item + type);

        const items=sanitizeItems[type];
        console.log(items);
        const updatedSanitizeList = { ...sanitizeItems };
		const typeParamList = { ...updatedSanitizeList[type] };
		typeParamList[item] = status;
		updatedSanitizeList[type] = typeParamList;
        const values = Object.values(typeParamList);
		selectAllInput.indeterminate = values.every((v) => v === true) && values.some((v) => v === true);
        setSanitizeItems(updatedSanitizeList);
    };

    const handleAllCheckboxChange = (type: string, status: boolean) => {
		const updatedSanitizeList = { ...sanitizeItems };
		const typeParamList = { ...updatedSanitizeList[type] };
		Object.keys(typeParamList).map((item) => (typeParamList[item] = status));
		updatedSanitizeList[type] = typeParamList;
		setSanitizeItems(updatedSanitizeList);
	};

    const printUpdated = () => {
        console.log(sanitizeItems);
        return(<div></div>);
    }
    const ref = useRef<ElementRef<"div">>(null);

    return(
        <div ref={ref}>
            {
                Object.keys(sanitizeItems).map(type => {
                    const items = sanitizeItems[type];
                    const size = Object.keys(items).length;
                    const selectAllValues = `all-${type}`;
                    console.log(selectAllValues);
                    console.log(ref);
                    if(size) {
                        return (
                            <>
                                <h3 className="text-2xl font-bold ml-4 mt-3">{mapHeading[type]}</h3> 
                                <div className="flex ml-4">
                                    <span className="my-4 text-sm text-gray-500">Select preferred Sanitizing method:</span>
                                    <div className="flex items-center me-4 ml-4">
                                        <input id="inline-radio" type="radio" value="" name={type} className="w-4 h-4 text-blue-900 bg-gray-100 
                                        border-gray-300 focus:ring-blue-900 dark:focus:ring-blue-900 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                        <label htmlFor="inline-radio" className="ms-2 text-xs font-normal text-gray-800 dark:text-gray-300">Hash</label>
                                    </div>
                                    <div className="flex items-center me-4">
                                        <input id="inline-radio" type="radio" value="" name={type} className="w-4 h-4 text-blue-900 bg-gray-100 
                                        border-gray-300 focus:ring-blue-900 dark:focus:ring-blue-900 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                        <label htmlFor="inline-radio" className="ms-2 text-xs font-normal text-gray-800 dark:text-gray-300">Remove</label>
                                    </div>
                                </div>
                                <div className="ml-6 mb-2" >
                                        <input id={selectAllValues} type="checkbox" checked={Object.keys(items).every((k) => items[k])}
                                                className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded 
                                                focus:ring-blue-900 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                                                focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                                                onChange={(e) => {
                                                    handleAllCheckboxChange(type, e.target.checked);
                                                }}
                                                >
                        
                                                </input>
                                        <label className="text-base font-medium text-gray-900 ml-2">Sanatize all</label>

                                    </div>
                                    <div key={type} className="space-y-1 columns-1 lg:columns-2 xl:columns-3 px-2 ml-4 mr-4 pb-2 pt-2 shadow-inner">
                                        {
                                        Object.entries(items).map(([item, status]: [string, boolean])=> {
                                            return(<div key={item}>            
                                                <input type="checkbox" checked={status}
                                                className="w-4 h-4 text-blue-900 bg-gray-100 border-gray-300 rounded 
                                                focus:ring-blue-900 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                                                focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                                                onChange={() => {
                                                    const selectAll = ref.current?.querySelector(
                                                        `#${selectAllValues}`,
                                                    );
                                                    console.log(ref);
                                                    console.log(selectAll);
                                                    if(selectAll instanceof HTMLInputElement) {
                                                        handleCheckedSanitizeItem(!status, type,item,selectAll);
                                                    }
                                                    
                                                }}
                                                >
                        
                                                </input>
                                                <label htmlFor="default-checkbox" 
                                                className="ms-2 text-sm font-normal text-gray-900 dark:text-gray-300">{item}</label>
                                            </div>)
                                        })  
                                        
                                        }
                                    </div>
                            </>
                        )
                    }    
                }
            )}
            <div>{printUpdated()}</div>
        </div>
    );
};