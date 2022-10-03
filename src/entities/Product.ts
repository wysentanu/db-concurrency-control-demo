import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  stock!: number;

  @Property({ version: true })
  version!: number;

  constructor(name: string, stock: number) {
    this.name = name;
    this.stock = stock;
  }
}