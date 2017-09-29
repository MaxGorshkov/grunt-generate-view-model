"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
class FileMetadata {
    constructor(filename = null, classes = null, imports = []) {
        this.filename = filename;
        this.classes = classes;
        this.imports = imports;
    }
}
exports.FileMetadata = FileMetadata;
//# sourceMappingURL=filemetadata.js.map