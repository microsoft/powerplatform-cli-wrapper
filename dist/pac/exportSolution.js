"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSolution = void 0;
function exportSolution(pac, { actionParameters: { name, path } }) {
    // Handle export parameters
    return pac("solution", "export", "--name", name, "--path", path);
}
exports.exportSolution = exportSolution;

//# sourceMappingURL=exportSolution.js.map
