"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const platform_express_1 = require("@nestjs/platform-express");
const Papa = require("papaparse");
const XLSX = require("xlsx");
const fs = require("fs");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    uploadFile(arquivo) {
        try {
            if (!arquivo) {
                return { status: 400, message: 'Nenhum arquivo enviado' };
            }
            const caminho = arquivo.path;
            let data;
            if (arquivo.mimetype === 'text/csv') {
                const csvData = fs.readFileSync(caminho, 'utf8');
                const results = Papa.parse(csvData, { header: true });
                data = results.data;
            }
            else if (arquivo.mimetype ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                const workbook = XLSX.readFile(caminho);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                let rows = XLSX.utils.sheet_to_json(worksheet);
                rows = rows.map((row) => {
                    const newRow = { ...row };
                    [
                        'data início',
                        'data status',
                        'próximo ciclo',
                        'data cancelamento',
                    ].forEach((dateField) => {
                        if (newRow[dateField]) {
                            const date = XLSX.SSF.parse_date_code(newRow[dateField]);
                            newRow[dateField] =
                                `${date.y}-${date.m < 10 ? '0' + date.m : date.m}-${date.d < 10 ? '0' + date.d : date.d}`;
                        }
                    });
                    return newRow;
                });
                data = rows;
            }
            else {
                return { status: 400, message: 'Tipo de arquivo não suportado' };
            }
            return data;
        }
        catch (error) {
            return { status: 500, message: 'Erro no servidor.' };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { dest: 'uploads/' })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "uploadFile", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map