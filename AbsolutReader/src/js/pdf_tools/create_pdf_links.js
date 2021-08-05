import { encodeToBase64, PDFDocument } from "pdf-lib"; //Adding links

function createPageLinkAnnotation (pdfDoc, id) {

    pdfDoc.context.register(
    pdfDoc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',

        Rect: [coordinate_dic["x"], coordinate_dic["y"], coordinate_dic["right_x"], coordinate_dic["right_y"]],

        //Colors go here
        Border: [0, 0, 1],
        C: [0, 0, 1],

        Dest: ['[Chaimager:${id}]', 'XYZ', null, null, null],
    }),
    )
}

export async function make_links (pdfDoc, id, array_coordinate_dic) {

    var pdfDoc = await PDFDocument.load(pdfDoc);
    console.log("a"); //Not loading???

    const pages = pdfDoc.getPages();
    var page = pages[coordinate_dic["page"]];

    page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([createPageLinkAnnotation(pdfDoc, id)]));

    const pdfBytes = await pdfDoc.save();
    console.log(pdfBytes);

}