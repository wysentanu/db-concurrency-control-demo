import { MySqlDriver } from "@mikro-orm/mysql";
import { LockMode, MikroORM, OptimisticLockError } from "@mikro-orm/core";
import { Product } from "src/entities";

// Apple product Id
const appleId = 1;

// @ts-ignore
async function noLock(orm: MikroORM<MySqlDriver>) {
  // John wants to buy an apple
  const johnContext = await orm.em.fork();
  const JohnProcess = async () => {
    const apple = await johnContext.findOne(
      Product,
      appleId,
    );

    apple!.stock -= 3;
    await johnContext.persistAndFlush(apple!);
    console.info("SUCCESS ::: NO_LOCK ::: John bought 3 apples");
  };

  // Cena wants to buy an apple
  const cenaContext = await orm.em.fork();
  const cenaProcess = async () => {
    const apple = await cenaContext.findOne(
      Product,
      appleId,
    );

    apple!.stock -= 2;
    await cenaContext.persistAndFlush(apple!);
    console.info("SUCCESS ::: NO_LOCK ::: Cena bought 2 apples");
  }

  // Concurrently buy apples
  await Promise.all([
    JohnProcess(),
    cenaProcess(),
  ]);
}

// @ts-ignore
async function optimisticLock(orm: MikroORM<MySqlDriver>) {
  // John wants to buy an apple
  const johnContext = await orm.em.fork();
  const JohnProcess = async () => {
    try {
      const apple = await johnContext.findOne(
        Product,
        appleId,
        {
          lockMode: LockMode.OPTIMISTIC,
        }
      );

      apple!.stock -= 3;
      await johnContext.persistAndFlush(apple!);
      console.info("SUCCESS ::: OPTIMISTIC_LOCK ::: John bought 3 apples");
    } catch (err) {
      if (err instanceof OptimisticLockError) {
        console.error("FAILED ::: OPTIMISTIC_LOCK ::: John can't buy an apple, the stock has been changed by Cena");
      }
    }
  };

  // Cena wants to buy an apple
  const cenaContext = await orm.em.fork();
  const cenaProcess = async () => {
    try {
      const apple = await cenaContext.findOne(
        Product,
        appleId,
        {
          lockMode: LockMode.OPTIMISTIC,
        }
      );

      apple!.stock -= 2;
      await cenaContext.persistAndFlush(apple!);
      console.info("SUCCESS ::: OPTIMISTIC_LOCK ::: Cena bought 2 apples");
    } catch (err) {
      if (err instanceof OptimisticLockError) {
        console.error("FAILED ::: OPTIMISTIC_LOCK ::: Cena can't buy an apple, the stock has been changed by John");
      }
    }
  }

  // Concurrently buy apples
  await Promise.all([
    JohnProcess(),
    cenaProcess(),
  ]);
}

// @ts-ignore
async function pessimisticLock(orm: MikroORM<MySqlDriver>) {
  // John wants to buy an apple
  const johnContext = await orm.em.fork();
  const JohnProcess = johnContext.transactional(async (em) => {
    const apple = await em.findOne(
      Product,
      appleId,
      {
        lockMode: LockMode.PESSIMISTIC_WRITE,
      }
    );
    apple!.stock -= 3;
    em.persist(apple!);
    console.info("SUCCESS ::: PESSIMISTIC_LOCK ::: John bought 3 apples");
  });

  // Cena wants to buy an apple
  const cenaContext = await orm.em.fork();
  const cenaProcess = cenaContext.transactional(async (em) => {
    const apple = await em.findOne(
      Product,
      appleId,
      {
        lockMode: LockMode.PESSIMISTIC_WRITE,
      }
    );
    apple!.stock -= 2;
    em.persist(apple!);
    console.info("SUCCESS ::: PESSIMISTIC_LOCK ::: Cena bought 2 apples");
  });

  // Concurrently buy apples
  await Promise.all([
    JohnProcess,
    cenaProcess,
  ]);
}

async function main () {
  const orm = await MikroORM.init<MySqlDriver>();

  // 1. No Locking, will cause data inconsistency (Lost Update)
  await noLock(orm);

  // 2. Optimistic Locking, using version field to prevent data inconsistency
  await optimisticLock(orm);

  // 3. Pessimistic Locking, using SELECT FOR UPDATE (exclusive lock read and write for the row)
  await pessimisticLock(orm);
}

main().then(() => {
  console.log('DONE');
  process.exit(0);
}).catch((err) => {
  console.error(err);
});
