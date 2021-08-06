import { pdfjsWorker } from "pdfjs-dist/legacy/build/pdf.worker.entry";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; //Getting coordinates of text in pdf
import { encodeToBase64, PDFDocument, PDFName, PDFString, PDFArray,rgb } from "pdf-lib"; //Adding links

export async function pdf_editor (pdfDoc, keywords){

    coords = await get_pdf_coordinates(pdfDoc, keywords); //We get the coords array

    base64_pdf = await make_links(pdfDoc, keywords, coords);

    console.log('Returning PDF after link added');
    
    return base64_pdf;

}

async function get_pdf_coordinates (pdfDoc, keywords){

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

async function make_links (pdfDoc, id, array_coordinate_dic) {

    var pdfDoc = await PDFDocument.load(pdfDoc, {ignoreEncryption: true});
    //TODO #5

    const pages = await pdfDoc.getPages();

    for (let i = 0; i < array_coordinate_dic.length; i++){

        var page_number = array_coordinate_dic[i]["page"];

        var page = pages[page_number-1]; //Loading page

        const coordinate_dic = array_coordinate_dic[i];

        //Drawing rectangle of the link
        page.drawRectangle({
            x: coordinate_dic["x"],
            y: coordinate_dic["y"],
            width: coordinate_dic["right_x"]-coordinate_dic["x"],
            height: coordinate_dic["right_y"]-coordinate_dic["y"],
            color: rgb(0.75, 0.2, 0.2),
            opacity: 0.5,
          });

        var linkAnnotation = pdfDoc.context.obj({
            //Link adding information comes here
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [coordinate_dic["x"], coordinate_dic["y"], coordinate_dic["right_x"], coordinate_dic["right_y"]],

            Border: [0, 0, 0], //Invisible border
            C: [0, 0, 1],  // 
            A: {
              Type: 'Action',
              S: 'URI',
              URI: PDFString.of('https://chaimager.me/[' + id + ']'), //It does not add if is not a valid url
            },
          });

        var linkAnnotationRef = pdfDoc.context.register(linkAnnotation);
        
        const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);

        if (annots){ //IF there are already annotations we just add a new one

            annots.push(linkAnnotationRef);}

        else {  //Need to create a new array of annotations
             page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([linkAnnotationRef])); };

    }

    const pdfBytes = await pdfDoc.save();

    return encodeToBase64(pdfBytes); 
}