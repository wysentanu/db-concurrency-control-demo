import { Migration } from '@mikro-orm/migrations';

export class Migration20221003132838 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `product` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `stock` int not null) default character set utf8mb4 engine = InnoDB;');
  }

}
