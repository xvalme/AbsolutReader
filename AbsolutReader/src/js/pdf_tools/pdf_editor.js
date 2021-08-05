import { pdfjsWorker } from "pdfjs-dist/legacy/build/pdf.worker.entry";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; //Getting coordinates of text in pdf
import { encodeToBase64, PDFDocument, PDFName, PDFString, PDFArray } from "pdf-lib"; //Adding links

/*
Of interest:
https://github.com/mozilla/pdf.js/issues/5643
*/

export async function pdf_editor (pdfDoc, keywords){

    coords = await get_pdf_coordinates(pdfDoc, keywords); //We get the coords array
    console.log("Coords gotten.");

    make_links(pdfDoc, keywords, coords);

}

export async function get_pdf_coordinates (pdfDoc, keywords){

    /*Given a file (Already opened by fs), it uses Pdfjs library to get the coordinates of the keywords
    that exist in every single page, and returns an array of dictionarys with the coords and pages
    for the link adder.
    */

    //TODO #2
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;  //Setting stuff for running the pdfjs library
    
    var coords_array = [];

    const loadingTask = pdfjsLib.getDocument({data: pdfDoc});  //Conversts base64 to something pdfjs understands
	
    const doc = await loadingTask.promise

    var numPages = doc.numPages;

    for (let i = 1; i <= numPages; i++){

        page = await doc.getPage(i);

        content = await page.getTextContent();
                    
        var items = (content["items"]);

        for (let p = 0; p < items.length; p++){

            if (items[p]["str"].includes(keywords)){

                var transform = items[p]["transform"];
                var width = items[p]["width"];
                var height = items[p]["height"];
                var text = items[p]["str"];

                var coords = calculate_coords(i, transform, width, height, text, keywords);

                coords_array.push(coords)
                                    
            }
        }
    };
    return coords_array;
}   

function calculate_coords (page, transform, width, height, text, keywords){

    //Size (x coordinate system) of each letter
    var len_of_charachter = width / text.length;

    //Position of beggining of string we want
    var start_position = text.indexOf(keywords) * len_of_charachter;

    var x = transform[4] + start_position
    var y = transform[5];

    //Postions of the ending

    var right_y = y + height;

    var right_x = x + (keywords.length * len_of_charachter);

    return ({page:page, x: x, y:y, right_x:right_x, right_y: right_y});
}

export async function make_links (pdfDoc, id, array_coordinate_dic) {

    var pdfDoc = await PDFDocument.load(pdfDoc);

    const pages = await pdfDoc.getPages();

    for (let i = 0; i < array_coordinate_dic.length; i++){

        var page_number = array_coordinate_dic[i]["page"];

        var page = pages[page_number-1]; //Loading page

        const coordinate_dic = array_coordinate_dic[i];

        const linkAnnotation = pdfDoc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [coordinate_dic["x"], coordinate_dic["y"], coordinate_dic["right_x"], coordinate_dic["right_y"]],

            Border: [0, 0, 2],
            C: [0, 0, 1],
            A: {
              Type: 'Action',
              S: 'URI',
              URI: PDFString.of('https://chaimager.me/[' + id + ']'),
            },
          });

        const linkAnnotationRef = pdfDoc.context.register(linkAnnotation);

        page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([linkAnnotationRef]));

    }

    const pdfBytes = await pdfDoc.save();

    console.log(encodeToBase64(pdfBytes)); 
}