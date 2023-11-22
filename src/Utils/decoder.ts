
export const decodeValue = (encodeValue: string) => {
    const uridecodedValue=decodeURIComponent(encodeValue);

    const decodedSAML = atob(uridecodedValue);
    return decodedSAML;
}

export const encodeValue = (decodeValue: string) => {
    return encodeValue;
}

const removeSAMLSign = (value:any) => {
    const decodedSAML = decodeValue(value);
}