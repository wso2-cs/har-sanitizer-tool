import { ElementRef, useRef } from "react";
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


const renderSanitizeList = (sanitizeItemsList:SanitizeState) => {

    return Object.keys(sanitizeItemsList).map(key => {
        console.log(key);
      const items = sanitizeItemsList[key];
      if(items.length) {
        return ( 
            <div>
              <h3 className="text-3xl font-bold ml-4" key={"key"+key}>{mapHeading[key]}</h3> 
              <div key={key} className="grid grid-rows-6 grid-flow-col gap-2 ml-4 mt-4">
                {items.map(item => {
                  return <div key={item}>            
                            <input id="inline-checkbox" type="checkbox" value="" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                            focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                            focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                            <label htmlFor="default-checkbox" 
                            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{item}</label>
    
                            
                        </div>
                })} 
              </div>
              <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
            </div>
          )
      }
     
    });
  };
export const SanitizeSelector: React.FC<SanitizeSelectorProps> = ({
	sanitizeItems,
	setSanitizeItems,
}) => {
    console.log(sanitizeItems);
    return(
        <div>
            <div>{renderSanitizeList(sanitizeItems)}</div>
        </div>
    )
}