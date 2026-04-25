USE HotelManagementDB;
GO

-- Insert 10 users for the 10 existing roles
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (1, 'Test Admin', 'admin@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (2, 'Test Manager', 'manager@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (3, 'Test Receptionist', 'receptionist@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (4, 'Test Accountant', 'accountant@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (5, 'Test Housekeeping', 'housekeeping@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (6, 'Test Security', 'security@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (7, 'Test Chef', 'chef@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (8, 'Test Waiter', 'waiter@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (9, 'Test IT Support', 'it@test.com', '123456', 1);
INSERT INTO Users (role_id, full_name, email, password_hash, status) VALUES (10, 'Test Guest', 'guest@test.com', '123456', 1);
GO
