const userSchema = `
CREATE TABLE IF NOT EXISTS users (
    staffid CHAR(8) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    role ENUM ('admin', 'business_user') NOT NULL,
    password VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (staffid)
)`;

module.exports = userSchema;