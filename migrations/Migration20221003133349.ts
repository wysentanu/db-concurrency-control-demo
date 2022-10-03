import { Migration } from '@mikro-orm/migrations';

export class Migration20221003133349 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `product` add `version` int not null default 1;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `product` drop `version`;');
  }

}
