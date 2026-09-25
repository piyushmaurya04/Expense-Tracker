# Database Schema

This document describes the tables defined in the SQL script for the Expense Tracker project.

## Database: `expensetracker`

```sql
CREATE DATABASE expensetracker;
USE expensetracker;
```

### `users`

Stores registered application users.

| Column | Type | Null | Key | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | `BIGINT` | No | Primary key | Auto-increment | Unique user identifier |
| `username` | `VARCHAR(50)` | No | Unique | None | User login/display name |
| `email` | `VARCHAR(100)` | No | Unique | None | User email address |
| `password` | `VARCHAR(255)` | No | None | None | Stored password value |
| `created_at` | `TIMESTAMP` | Yes | None | `CURRENT_TIMESTAMP` | Account creation time |

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `expence`

Stores user expenses. The table name is kept as `expence` to match the existing database and application queries. The conventional spelling would be `expense`.

| Column | Type | Null | Key | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | `BIGINT` | No | Primary key | Auto-increment | Unique expense identifier |
| `user_id` | `BIGINT` | No | Foreign key | None | Owner of the expense |
| `title` | `VARCHAR(100)` | No | None | None | Expense title |
| `category` | `VARCHAR(50)` | Yes | None | `NULL` | Expense category |
| `amount` | `DECIMAL(10,2)` | No | None | None | Expense amount |
| `expense_date` | `DATE` | No | None | None | Date of the expense |
| `note` | `TEXT` | Yes | None | `NULL` | Additional details |
| `created_at` | `TIMESTAMP` | Yes | None | `CURRENT_TIMESTAMP` | Record creation time |

Relationship: `expence.user_id` references `users.id`. Deleting a user deletes that user's expenses through `ON DELETE CASCADE`.

```sql
CREATE TABLE expence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `income`

Stores user income records.

| Column | Type | Null | Key | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | `BIGINT` | No | Primary key | Auto-increment | Unique income identifier |
| `user_id` | `BIGINT` | No | Foreign key | None | Owner of the income record |
| `title` | `VARCHAR(100)` | No | None | None | Income title |
| `category` | `VARCHAR(50)` | Yes | None | `NULL` | Income category |
| `amount` | `DECIMAL(10,2)` | No | None | None | Income amount |
| `income_date` | `DATE` | No | None | None | Date of the income |
| `note` | `TEXT` | Yes | None | `NULL` | Additional details |
| `created_at` | `TIMESTAMP` | Yes | None | `CURRENT_TIMESTAMP` | Record creation time |

Relationship: `income.user_id` references `users.id`. Deleting a user deletes that user's income records through `ON DELETE CASCADE`.

```sql
CREATE TABLE income (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    income_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `refresh_tokens`

Stores refresh tokens associated with users.

| Column | Type | Null | Key | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | `BIGINT` | No | Primary key | Auto-increment | Unique token record identifier |
| `user_id` | `BIGINT` | No | Foreign key | None | User who owns the token |
| `token` | `VARCHAR(500)` | No | Unique | None | Refresh token value |
| `expiry_date` | `TIMESTAMP` | No | None | None | Token expiration time |
| `create_at` | `TIMESTAMP` | Yes | None | `CURRENT_TIMESTAMP` | Token creation time |

Relationship: `refresh_tokens.user_id` references `users.id`. Deleting a user deletes their refresh tokens through `ON DELETE CASCADE`.

Note: The column is named `create_at` in the existing script. `created_at` would be the more consistent name, but changing it would require updating application code and queries.

```sql
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Database: `python`

The following table belongs to a separate database and is unrelated to the Expense Tracker tables.

```sql
CREATE DATABASE python;
USE python;
```

### `python.users`

Stores simple user profile data for the separate `python` database.

| Column | Type | Null | Key | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `id` | `INT` | No | Primary key | Auto-increment | Unique record identifier |
| `name` | `VARCHAR(100)` | Yes | None | `NULL` | Person's name |
| `age` | `INT` | Yes | None | `NULL` | Person's age |
| `city` | `VARCHAR(50)` | Yes | None | `NULL` | Person's city |

```sql
CREATE TABLE users (
    name VARCHAR(100),
    age INT,
    city VARCHAR(50)
);

ALTER TABLE users
    ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;
```

Equivalent single-statement definition:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    city VARCHAR(50)
);
```

## Useful Inspection Queries

```sql
USE expensetracker;

SHOW TABLES;
DESCRIBE users;
DESCRIBE expence;
DESCRIBE income;
DESCRIBE refresh_tokens;

SELECT * FROM users;
SELECT * FROM expence;
SELECT * FROM income;
SELECT * FROM refresh_tokens;
```

For the separate database:

```sql
USE python;
SHOW TABLES;
DESCRIBE users;
SELECT * FROM users;
```

## Notes About the Original Script

- `DESCRIBE` must be followed by a table name, for example `DESCRIBE users;`.
- `ALTER TABLE users;` is incomplete and will fail. An alteration must specify an operation such as `ADD COLUMN`, `MODIFY COLUMN`, or `DROP COLUMN`.
- `SELECT * FROM expensetracker WHERE userid = 8;` treats the database name as a table. To query expenses by user, use `SELECT * FROM expence WHERE user_id = 8;`.
- `ROLLBACK` only affects transactional statements that have not been committed. Depending on the storage engine and transaction settings, previous `INSERT` statements may already be committed.
- The sample user insert uses random usernames and emails. Random values can theoretically collide with the unique constraints.
- Passwords should not be stored using `MD5`. The application should store passwords using a slow password-hashing algorithm such as BCrypt, Argon2, or SCrypt.

## Java Entity Verification

The schema was checked against the JPA entities in `src/main/java/com/Tracker/Entity` and the datasource configuration in `src/main/resources/application.properties`.

| Java entity | Database table | Result |
| --- | --- | --- |
| `User` | `users` | Matches |
| `Expense` | `expence` | Matches |
| `Income` | `income` | Matches |
| `RefreshToken` | `refresh_tokens` | Matches |

### Column Mapping Results

- `User.id` (`Long`) maps to `users.id` (`BIGINT` auto-increment primary key).
- `User.username`, `email`, and `password` match the database lengths, uniqueness, and non-null constraints.
- `Expense.user`, `Income.user`, and `RefreshToken.user` all map to `user_id` with a non-null many-to-one relationship.
- `Expense.expenseDate` maps to `expense_date` and `Income.incomeDate` maps to `income_date`.
- `RefreshToken.expiryDate` maps to `expiry_date` and `RefreshToken.createAt` maps to `create_at`.
- `amount` is mapped as `BigDecimal` with precision `10` and scale `2`, matching both financial tables.
- `note` is mapped as `TEXT`, matching both financial tables.
- All Java `LocalDateTime` timestamp fields match the SQL `TIMESTAMP` columns.

### Findings and Caveats

1. The datasource is configured for `jdbc:mysql://localhost:3306/expensetracker`, so the application uses the `expensetracker` database. The separate `python` database is not used by this Spring Boot application.
2. `User` has inverse collections for `expenses` and `refreshTokens`, but it does not currently declare an inverse `incomes` collection. This does not prevent `Income.user` from working, but add the following field if navigation from a user to all incomes is needed:

    ```java
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Income> incomes = new ArrayList<>();
    ```

3. `cascade = CascadeType.ALL` and `orphanRemoval = true` are JPA-level behaviors. They are separate from the SQL `ON DELETE CASCADE` constraint. Keep both when the application and direct SQL operations should have consistent delete behavior.
4. `spring.jpa.hibernate.ddl-auto=update` allows Hibernate to modify the schema automatically. For production deployments, use versioned migrations such as Flyway or Liquibase instead of relying on `update`.
