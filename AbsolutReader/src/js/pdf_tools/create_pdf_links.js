import { encodeToBase64, PDFDocument } from "pdf-lib"; //Adding links

const createPageLinkAnnotation = (pdfDoc, id , color, left_x, left_y, right_x, right_y) =>
pdfDoc.context.register(
pdfDoc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',

    Rect: [left_x, left_y, right_x, right_y],

    //Colors go here
    Border: [0, 0, 1],
    C: [0, 0, 1],

    Dest: ['[Chaimager:${id}]', 'XYZ', null, null, null],
}),
);