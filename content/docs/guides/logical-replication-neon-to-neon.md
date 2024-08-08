---
title: Replicate data from one Neon project to another
subtitle: Use logical replication to migrate data to a different Neon project, account, Postgres version, or region
enableTableOfContents: true
isDraft: false
updatedOn: '2024-08-02T17:25:18.435Z'
---

Neon's logical replication feature allows you to replicate data from one Neon project to another. This enables different replication scenarios, including:

- **Postgres version migration**: Moving data from one Postgres version to another; for example, from a Neon project that runs Postgres 15 to a Neon project that runs Postgres 16
- **Region migration**: Moving data from one region to another; for example, from a Neon project in one region to a Neon project in a different region
- **Neon account migration**: Moving data from a Neon project owned by one account to a project owned by a different account; for example, from a personal Neon account to a business-owned Neon account

These are some common Neon-to-Neon replication scenarios. There may be others. You can follow the steps in this guide for any scenario that requires replicating data between different Neon projects.

## Prerequisites

- A source Neon project with a database containing the data you want to replicate. Alternatively, if you need some data to play with, you can use the following statements to create a table with sample data:

  ```sql shouldWrap
  CREATE TABLE IF NOT EXISTS playing_with_neon(id SERIAL PRIMARY KEY, name TEXT NOT NULL, value REAL);
  INSERT INTO playing_with_neon(name, value)
  SELECT LEFT(md5(i::TEXT), 10), random() FROM generate_series(1, 10) s(i);
  ```

- A destination Neon project.

For information about creating a Neon project, see [Create a project](/docs/manage/projects#create-a-project).

## Enable logical replication in the source Neon project

In the Neon project containing your source database, enable logical replication. You only need to perform this step on the source Neon project.

<Admonition type="important">
Enabling logical replication modifies the Postgres `wal_level` configuration parameter, changing it from `replica` to `logical` for all databases in your Neon project. Once the `wal_level` setting is changed to `logical`, it cannot be reverted. Enabling logical replication restarts all computes in your Neon project, meaning that active connections will be dropped and have to reconnect.
</Admonition>

To enable logical replication:

1. Select your project in the Neon Console.
2. On the Neon **Dashboard**, select **Settings**.
3. Select **Logical Replication**.
4. Click **Enable** to enable logical replication.

You can verify that logical replication is enabled by running the following query:

```sql
SHOW wal_level;
 wal_level
-----------
 logical
```

## Prepare the destination database

This section describes how to prepare your destination database.

When configuring logical replication in Postgres, the tables in the source database that you are replicating from must also exist in the destination database, and they must have the same table names and columns. You can create the tables manually in your destination database or use a utility like `pg_dump` to dump the schema from your source database. For example, the following `pg_dump` command dumps the database schema from a database named `neondb`. The command uses a database connection URL. You can obtain a connection URL for your database from **Connection Details** widget on the Neon Dashboard. For instructions, see [Connect from any application](/docs/connect/connect-from-any-app).

```bash
pg_dump --schema-only \
	--no-privileges \
	"postgresql://neondb_owner:<password>@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require" \
	> schema_dump.sql
```

To load the schema into your destination database, you can run the following [psql](/docs/connect/query-with-psql-editor) command, specifying the database connection URL for your destination database:

```bash
 psql \
	"postgresql://neondb_owner:<password>@ep-mute-recipe-123456.us-east-2.aws.neon.tech/neondb?sslmode=require" \
	< schema_dump.sql
```

<Admonition type="note">
Notice that the database URLs for the source and destination databases differ. This is because they are different Postgres instances. Your source and destination database URLs will also differ.
</Admonition>

You can verify that the schema was loaded by running the following command on the destination database via [psql](/docs/connect/query-with-psql-editor) or the [Neon SQL Editor](/docs/get-started-with-neon/query-with-neon-sql-editor):

```bash
\dt
```

If you've dumped and loaded the database schema as described above, this command should display the same schema that exists in your source database.

If you're using the sample `playing_with_neon` table, you can create the same table on the destination database with the following statement:

```sql shouldWrap
CREATE TABLE IF NOT EXISTS playing_with_neon(id SERIAL PRIMARY KEY, name TEXT NOT NULL, value REAL);
```

## Create a publication on the source database

Publications are a fundamental part of logical replication in Postgres. They allow you to define the database changes to be replicated to subscribers.

To create a publication for all tables in your database:

```sql
CREATE PUBLICATION my_publication FOR ALL TABLES;
```

<Admonition type="note">
It's also possible to create a publication for specific tables; for example, to create a publication for the `playing_with_neon` table, you can use the following syntax:

```sql
CREATE PUBLICATION playing_with_neon_publication FOR TABLE playing_with_neon;
```

For details, see [CREATE PUBLICATION](https://www.postgresql.org/docs/current/sql-createpublication.html), in the PostgreSQL documentation.
</Admonition>

### Create a subscription

After defining a publication on the source database, you need to define a subscription on the destination database.

1. Use `psql` or another SQL client to connect to your destination database.
2. Create the subscription using the using a `CREATE SUBSCRIPTION` statement.

   ```sql
   CREATE SUBSCRIPTION my_subscription
   CONNECTION 'postgresql://neondb_owner:<password>@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb'
   PUBLICATION my_publication;
   ```

   - `subscription_name`: A name you chose for the subscription.
   - `connection_string`: The connection string for the source Neon database, where you defined the publication.
   - `publication_name`: The name of the publication you created on the source Neon database.

3. Verify the subscription was created by running the following command:

   ```sql
   SELECT * FROM pg_stat_subscription;
   ```

   The subscription (`my_subscription`) should be listed, confirming that your subscription has been successfully created.

## Test the replication

Testing your logical replication setup ensures that data is being replicated correctly from the publisher to the subscriber database. This example assumes you have table named `playing_with_neon`. Substitute for your own table name if you used your own tables.

1. Connect to your source Neon database (the publisher) and insert another 10 rows of data. For example:

   ```sql
   INSERT INTO playing_with_neon(name, value)
    SELECT LEFT(md5(i::TEXT), 10), random() FROM generate_series(1, 10) s(i);
   ```

2. After making changes, query the `playing_with_neon` table on the publisher to confirm your `INSERT`:

   ```sql
   SELECT * FROM playing_with_neon;
   ```

   Note the changes you made for comparison with the subscriber's data.

3. Now, connect to your destination database (the subscriber):

   ```bash shouldWrap
   psql postgresql://neondb_owner:<password>@ep-mute-recipe-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. Query the `playing_with_neon` table:

   ```sql
   SELECT * FROM playing_with_neon;
   ```

   Compare the results with what you observed on the publisher.

5. On the subscriber, you can also check the status of the replication:

   ```sql
   SELECT * FROM pg_stat_subscription;
   ```

   Look for the `last_msg_receive_time` to confirm that the subscription is active and receiving data.