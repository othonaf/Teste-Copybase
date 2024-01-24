import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/' }))
  uploadFile(@UploadedFile() arquivo) {
    try {
      if (!arquivo) {
        return { status: 400, message: 'Nenhum arquivo enviado' };
      }
      const caminho: string = arquivo.path;
      let data;

      if (arquivo.mimetype === 'text/csv') {
        // Processar arquivo CSV
        const csvData = fs.readFileSync(caminho, 'utf8');
        const results = Papa.parse(csvData, { header: true });
        data = results.data;
      } else if (
        arquivo.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        // Processar arquivo XLSX
        const workbook = XLSX.readFile(caminho);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        let rows = XLSX.utils.sheet_to_json(worksheet) as any[];

        rows = rows.map((row: any) => {
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
      } else {
        return { status: 400, message: 'Tipo de arquivo não suportado' };
      }

      return data;
    } catch (error) {
      return { status: 500, message: 'Erro no servidor.' };
    }
  }
}
