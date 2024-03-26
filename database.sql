CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    hashedpassword VARCHAR NOT NULL,
    userid VARCHAR NOT NULL UNIQUE
)



