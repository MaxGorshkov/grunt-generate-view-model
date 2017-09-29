"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_file_parser_1 = require("ts-file-parser");
const classmetadata_1 = require("./src/tasks/MakeView/model/classmetadata");
const fieldmetadata_1 = require("./src/tasks/MakeView/model/fieldmetadata");
const filemetadata_1 = require("./src/tasks/MakeView/model/filemetadata");
const nunjucks_1 = require("nunjucks");
function makeView(grunt) {
    grunt.registerMultiTask("makeView", function () {
        var metadata = createMetadatas(this.files, grunt, this);
        CreateFiles(metadata, grunt);
    });
}
module.exports = makeView;
function createMetadatas(files, grunt, obj) {
    var options = obj.options({
        encoding: grunt.file.defaultEncoding,
        processContent: false,
        processContentExclude: [],
        timestamp: false,
        mode: false
    });
    let generationFiles;
    generationFiles = new Array();
    var wasFiled = 0;
    var fileMet;
    var isOneFile = obj.data.oneFile;
    for (var file of files) {
        if (isOneFile) {
            if (fileMet === undefined) {
                fileMet = new filemetadata_1.FileMetadata();
            }
            fileMet.filename = file.orig.dest + "/common.ts";
            if (fileMet.classes === undefined) {
                fileMet.classes = new Array();
            }
        }
        if (!isOneFile) {
            fileMet = new filemetadata_1.FileMetadata();
            fileMet.filename = file.dest;
            fileMet.classes = new Array();
        }
        var stringFile = grunt.file.read(file.src, options);
        var jsonStructure = ts_file_parser_1.parseStruct(stringFile, {}, file.src);
        jsonStructure.classes.forEach(cls => {
            let classMet = new classmetadata_1.ClassMetadata();
            classMet.name = cls.name;
            classMet.fields = new Array();
            cls.decorators.forEach(dec => {
                if (dec.name === "GenerateView") {
                    classMet.generateView = true;
                    classMet.name = dec.arguments[0].toString();
                }
            });
            if (classMet.generateView === false) {
                return;
            }
            cls.fields.forEach(fld => {
                let fldMetadata = new fieldmetadata_1.FieldMetadata();
                fldMetadata.baseModelName = fld.name;
                if (fld.type.base !== undefined) {
                    fldMetadata.isArray = true;
                    fldMetadata.baseModelType = fld.type.base.typeName;
                    var curBase = fld.type.base;
                    while (curBase.base !== undefined) {
                        curBase = curBase.base;
                        fldMetadata.baseModelType = curBase.typeName;
                    }
                }
                else {
                    fldMetadata.baseModelType = fld.type.typeName;
                    var typeName = fld.type.typeName;
                    if (typeName !== "string" && typeName !== "number" && typeName !== "boolean" && typeName !== "undefined"
                        && typeName !== "null") {
                        fldMetadata.isComplexObj = true;
                    }
                }
                fldMetadata.name = fld.name;
                fldMetadata.type = fldMetadata.baseModelType;
                fld.decorators.forEach(dec => {
                    if (dec.name === "IgnoreViewModel") {
                        fldMetadata.ignoredInView = true;
                    }
                    if (dec.name === "ViewModelName") {
                        fldMetadata.name = dec.arguments[0].toString();
                    }
                    if (dec.name === "ViewModelType") {
                        fldMetadata.type = dec.arguments[0].toString();
                        let filename = dec.arguments[1].toString();
                        let insertedImport = "import { " + fldMetadata.type + "} from \"" + filename + "\";";
                        if (fileMet.imports.indexOf(insertedImport) === -1) {
                            fileMet.imports.push(insertedImport);
                        }
                    }
                });
                classMet.fields.push(fldMetadata);
            });
            fileMet.classes.push(classMet);
        });
        if (isOneFile && wasFiled === 0) {
            generationFiles.push(fileMet);
            wasFiled++;
        }
        if (!isOneFile) {
            generationFiles.push(fileMet);
        }
    }
    return generationFiles;
}
function CreateFiles(metadata, grunt) {
    nunjucks_1.configure("./src/tasks/makeView/view", { autoescape: true, trimBlocks: true });
    for (var i = 0; i < metadata.length; i++) {
        var mdata = metadata[i];
        mdata.classes = mdata.classes.filter((item) => item.generateView);
        var c = nunjucks_1.render("viewTemplateCommon.njk", { metafile: mdata });
        if (c && c.trim()) {
            grunt.file.write(metadata[i].filename, c);
        }
    }
}
//# sourceMappingURL=index.js.map