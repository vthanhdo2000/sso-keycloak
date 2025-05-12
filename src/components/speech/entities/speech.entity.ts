import { FileEntity } from 'src/components/file/entities/file.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';

@Entity('speechs')
export class SpeechEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => FileEntity, (file) => file.speech, { cascade: true })
  files: FileEntity[];
}
