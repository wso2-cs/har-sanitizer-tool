import { Type } from "typescript";
import sha256 from "fast-sha256";

interface Object<Type> {
    name: string;
    value: string;
}

export const hashValue = (hashValue: string) => {
    const encoder = new TextEncoder();
    const msgUint8 = encoder.encode(hashValue);

    const sha256HashedValue = sha256(msgUint8);

    const hashArray = Array.from(new Uint8Array(sha256HashedValue));
    const hashed = hashArray
        .map((b) => b.toString(24).padStart(2, "3"))
        .join(""); // convert bytes to hex string
    return hashed;
}

export const hashCookies = (cookies: Object<Type>[]) => {

    for (var i in cookies) {
        var hashed = hashValue(cookies[i].value);
        cookies[i].value = "Hashed: " + hashed;
    }

    return cookies;
};


export const hashHeaderCookies = (headers: Object<Type>[]): any => {

    for (let i in headers) {
        console.log(headers[i]);
        if (headers[i].name == "Cookie" || headers[i].name == "Set-Cookie") {
            const array = headers[i].value.split(';');
            for (let i in array) {
                const array1 = array[i].split('=');
                array1[1] = hashValue(array1[1]);
                array[i] = array1.join("=Hashed:");
            }
            const hashedValues = array.join(";");
            headers[i].value = hashedValues;
        } else if (headers[i].name == "Authorization") {
            const authorizationValue = headers[i].value.split(" ");
            const token = authorizationValue[1];
            console.log(token);
            if (token.includes(".")) {
                authorizationValue[1] = token.substring(0, token.lastIndexOf("."));
                console.log(authorizationValue[1]);
                headers[i].value = authorizationValue.join(" SignRemoved:");
                console.log(headers[i].value);
            } else {
                authorizationValue[1] = hashValue(token);
                headers[i].value = authorizationValue.join(" Hashed:");
            }
        }
    }
    console.log(headers);
    return headers;
};

export const hashPostQueryParams = (postDataParams: Object<Type>[]) => {
    //var postDataParams = harcontent.log.entries[63].request.postData.params;
    for (let i in postDataParams) {
        if (postDataParams[i].name == "code") {
            postDataParams[i].value = " Hashed:" + hashValue(postDataParams[i].value);
        }
    }
    return postDataParams;
}

export const hashQueryStringparams = (queryStringParams: Object<Type>[]) => {
    for (let i in queryStringParams) {
        if (queryStringParams[i].name == "code") {
            queryStringParams[i].value = " Hashed: " + hashValue(queryStringParams[i].value);
        }
    }
    return queryStringParams;
}

export const hashIdToken = (idToken: string) => {

    var baseurl = idToken.substring(0, idToken.indexOf("?"));
    var urlparams = idToken.substring(idToken.indexOf("?") + 1, idToken.length).split("&");
    console.log(urlparams);
    for (let i in urlparams) {
        var props = urlparams[i].split("=");
        if (props[0] == "id_token_hint") {
            const token = props[1];
            console.log(token);
            if (token.includes(".")) {
                props[1] = "Signature Removed:" + token.substring(0, token.lastIndexOf("."));
            }
        }
        urlparams[i] = props.join("=");
        return idToken = baseurl + "?" + (urlparams.join("&"));
    }
}