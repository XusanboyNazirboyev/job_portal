import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ResumeValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  private readonly maxSize = 5 * 1024 * 1024;

  transform(file: Express.Multer.File) {
     if(!file){
      throw new BadRequestException('Resume file required')
     }
     if(!this.allowedMimeTypes.includes(file.mimetype)){
      throw new BadRequestException('Only PDF and DOC/DOCX files are allowed');
     }
      if (file.size > this.maxSize) {
        throw new BadRequestException('File size must be less than 5MB');
      }

  }
}

