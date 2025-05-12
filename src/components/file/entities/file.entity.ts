import { SpeechEntity } from 'src/components/speech/entities/speech.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @ManyToOne(() => SpeechEntity, (speech) => speech.files, { onDelete: 'CASCADE' })
  speech: SpeechEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
