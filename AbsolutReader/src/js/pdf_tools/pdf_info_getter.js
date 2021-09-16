import { pdfjsWorker } from "pdfjs-dist/legacy/build/pdf.worker.entry";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

var RNFS = require('react-native-fs');
var base64js = require('base64-js');

export async function pdf_pagenumber_getter (filePath) {
    //Returns the thumbnail of a PDF for the library. Simply gets the 1st page,
    //converts it to an image and returns it as a base64 encoded string to save
    //on the json
    
    //Reading file:
    console.log("GEtting pages");

    var base64_pdf = await RNFS.readFile(filePath, 'base64');

    var pdfDoc = base64js.toByteArray(base64_pdf);

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    //Passing it to the pdf.js library
    const loadingTask = pdfjsLib.getDocument({data: pdfDoc});  //Converts base64 to something pdfjs understands

    const doc = await loadingTask.promise;

    var numPages = doc.numPages;

    return numPages;

}