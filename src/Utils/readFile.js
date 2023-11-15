import React, {Component} from "react";

function buildFileSelector(){
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('multiple', 'multiple');
    return fileSelector;
}

class Sanitizer extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        this.fileSelector = buildFileSelector();
    }

    handleFileSelect = (e) => {
        e.preventDefault();
        this.fileSelector.click();
    }

    render() {
        return (
        <div>
            <h2>Upload File</h2>
            <a className="button" href="" onClick={this.handleFileSelect}>Select files</a>
        </div>
        );
    }


    // showFile = async (e) => {
    //     e.preventDefault();
    //     const reader = new FileReader();

    //     reader.onload = async(e) => {
    //         const text = (e.target.result);
    //         console.log(text);
            
    //     }

    //     reader.readAsText(file);
    // }
}

export default Sanitizer;
