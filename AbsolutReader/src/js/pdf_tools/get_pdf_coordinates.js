import { pdfjsWorker } from "pdfjs-dist/legacy/build/pdf.worker.entry";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; //Getting coordinates of text in pdf

/*
Of interest:
https://github.com/mozilla/pdf.js/issues/5643
*/

export function get_pdf_coordinates (PdfDoc, keywords){

    /*Given a file (Already opened by fs), it uses Pdfjs library to get the coordinates of the keywords
    that exist in every single page, and returns a list of arrays, one for each page
    */

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;  //Setting stuff for running the pdfjs library

    const loadingTask = pdfjsLib.getDocument({data: PdfDoc});  //Conversts base64 to something pdfjs understands
	loadingTask.promise
		.then(function (doc) {
            var numPages = doc.numPages;
            for (let i = 1; i <= 1; i++){
                doc.getPage(i)
                    .then(function (page) {
                         return page.getTextContent();})
                            .then(function (content) {
                                var items = (content["items"]);
                                for (let p = 0; p < items.length; p++){
                                    if (items[p]["str"].includes(keywords)){

                                    var transform = items[p]["transform"];
                                    var width = items[p]["width"];
                                    var height = items[p]["height"];
                                    var text = items[p]["str"];

                                    var coords = calculate_coords(transform, width, height ,text, keywords);
                                    return coords;
                                    }
                                }

                                })
                    }})

    function calculate_coords (transform, width, height, text, keywords){

        //Size (x coordinate system) of each letter
        var len_of_charachter = width / text.length;

        //Position of beggining of string we want
        var start_position = text.indexOf(keywords) * len_of_charachter;

        var x = transform[4] + start_position
        var y = transform[5];

        //Postions of the ending

        var right_y = y + height;

        var right_x = x + (keywords.length * len_of_charachter);

        return ({x: x, y:y, right_x:right_x, right_y: right_y});
    }
}