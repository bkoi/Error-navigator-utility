const transactionSchema = `
CREATE TABLE IF NOT EXISTS transactions (
    messageid VARCHAR(50) NOT NULL UNIQUE,
    UETR VARCHAR(36) NOT NULL UNIQUE,
    F20 VARCHAR(16) NOT NULL UNIQUE,
    createddate TIMESTAMP NOT NULL,
    event_desc TEXT,
    root_cause TEXT,
    staffid CHAR(8) NOT NULL UNIQUE,
    PRIMARY KEY (messageid),
    FOREIGN KEY (staffid) REFERENCES users(staffid)
)`;

module.exports = transactionSchema;