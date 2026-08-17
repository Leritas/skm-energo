-- 1. Таблица пользователей
-- DEPRECATED: колонка Role (admin|client). Актуальная модель — Prisma User + Role + UserRole
-- (см. docs/superpowers/specs/2026-07-21-auth-roles-permissions-design.md).
CREATE TABLE "User" (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL CHECK (Role IN ('admin', 'client')),
    CONSTRAINT pk_user PRIMARY KEY (ID),
    CONSTRAINT uq_user_email UNIQUE (Email)
);

-- 2. Таблица категорий (с рекурсивной связью)
CREATE TABLE Category (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    ParentCategoryID INTEGER,
    CONSTRAINT pk_category PRIMARY KEY (ID),
    CONSTRAINT uq_category_name UNIQUE (Name),
    CONSTRAINT fk_category_parent FOREIGN KEY (ParentCategoryID) REFERENCES Category(ID)
);

-- 3. Таблица поставщиков (расширенные реквизиты)
CREATE TABLE Supplier (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    Name VARCHAR(255) NOT NULL,
    Type VARCHAR(50) NOT NULL CHECK (Type IN ('ООО', 'ИП', 'АО', 'ЗАО')),
    INN VARCHAR(12) NOT NULL,
    Address TEXT,
    ContactPerson VARCHAR(255),
    Phone VARCHAR(20),
    Email VARCHAR(255),
    CONSTRAINT pk_supplier PRIMARY KEY (ID),
    CONSTRAINT uq_supplier_name UNIQUE (Name),
    CONSTRAINT uq_supplier_inn UNIQUE (INN)
);

-- 4. Таблица товаров
CREATE TABLE Product (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    Name VARCHAR(255) NOT NULL,
    Article VARCHAR(100) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL CHECK (Price > 0),
    Description TEXT,
    StockQuantity INTEGER NOT NULL DEFAULT 0 CHECK (StockQuantity >= 0),
    CategoryID INTEGER NOT NULL,
    CONSTRAINT pk_product PRIMARY KEY (ID),
    CONSTRAINT uq_product_article UNIQUE (Article),
    CONSTRAINT fk_product_category FOREIGN KEY (CategoryID) REFERENCES Category(ID)
);

-- 5. Таблица связи "товар-поставщик" (многие ко многим)
CREATE TABLE ProductSupplier (
    ProductID INTEGER NOT NULL,
    SupplierID INTEGER NOT NULL,
    CONSTRAINT pk_product_supplier PRIMARY KEY (ProductID, SupplierID),
    CONSTRAINT fk_ps_product FOREIGN KEY (ProductID) REFERENCES Product(ID),
    CONSTRAINT fk_ps_supplier FOREIGN KEY (SupplierID) REFERENCES Supplier(ID)
);

-- 6. Таблица фотографий товаров
CREATE TABLE Photo (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    URL VARCHAR(500) NOT NULL,
    AltText VARCHAR(255),
    ProductID INTEGER NOT NULL,
    CONSTRAINT pk_photo PRIMARY KEY (ID),
    CONSTRAINT fk_photo_product FOREIGN KEY (ProductID) REFERENCES Product(ID)
);

-- 7. Таблица документов товаров
CREATE TABLE Document (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    FileName VARCHAR(255) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileType VARCHAR(50) NOT NULL CHECK (FileType IN ('pdf', 'docx', 'xlsx')),
    ProductID INTEGER NOT NULL,
    CONSTRAINT pk_document PRIMARY KEY (ID),
    CONSTRAINT fk_document_product FOREIGN KEY (ProductID) REFERENCES Product(ID)
);

-- 8. Таблица новостей
CREATE TABLE News (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    PublishDate DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT pk_news PRIMARY KEY (ID)
);

-- 9. Таблица отзывов
CREATE TABLE Review (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    Text TEXT,
    Rating INTEGER NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UserID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    CONSTRAINT pk_review PRIMARY KEY (ID),
    CONSTRAINT fk_review_user FOREIGN KEY (UserID) REFERENCES "User"(ID),
    CONSTRAINT fk_review_product FOREIGN KEY (ProductID) REFERENCES Product(ID)
);

-- 10. Таблица заказов
CREATE TABLE "Order" (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (Status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled')),
    TotalAmount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (TotalAmount >= 0),
    UserID INTEGER NOT NULL,
    CONSTRAINT pk_order PRIMARY KEY (ID),
    CONSTRAINT fk_order_user FOREIGN KEY (UserID) REFERENCES "User"(ID)
);

-- 11. Таблица элементов заказа
CREATE TABLE OrderItem (
    ID INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
    Quantity INTEGER NOT NULL CHECK (Quantity > 0),
    PriceAtOrder DECIMAL(10, 2) NOT NULL CHECK (PriceAtOrder > 0),
    OrderID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    CONSTRAINT pk_order_item PRIMARY KEY (ID),
    CONSTRAINT fk_oi_order FOREIGN KEY (OrderID) REFERENCES "Order"(ID),
    CONSTRAINT fk_oi_product FOREIGN KEY (ProductID) REFERENCES Product(ID)
);

-- ============================================================
-- Представления (для непараметризованных запросов)
-- ============================================================

-- Представление 1: Товары с категориями и родительскими категориями
CREATE VIEW v_products_with_categories AS
SELECT p.ID,
       p.Name AS ProductName,
       p.Article,
       p.Price,
       p.StockQuantity,
       c.Name AS CategoryName,
       pc.Name AS ParentCategoryName
FROM Product p
JOIN Category c ON p.CategoryID = c.ID
LEFT JOIN Category pc ON c.ParentCategoryID = pc.ID;

-- Представление 2: Поставщики типа ООО
CREATE VIEW v_suppliers_ooo AS
SELECT Name, INN, Address
FROM Supplier
WHERE Type = 'ООО';

-- Представление 3: Товары, имеющие хотя бы один отзыв с рейтингом 5
CREATE VIEW v_products_with_five_star_reviews AS
SELECT DISTINCT p.Name, p.Article
FROM Product p
JOIN Review r ON p.ID = r.ProductID
WHERE r.Rating = 5;

-- Представление 4: Email пользователей, сделавших заказ на сумму более 10000
CREATE VIEW v_users_with_high_value_orders AS
SELECT DISTINCT u.Email
FROM "User" u
JOIN "Order" o ON u.ID = o.UserID
WHERE o.TotalAmount > 10000;

-- ============================================================
-- Функции (для параметризованных запросов)
-- ============================================================

-- Функция 1: Получение подкатегорий для заданной категории
CREATE OR REPLACE FUNCTION get_subcategories(p_category_id INTEGER)
RETURNS TABLE(ID INTEGER, Name VARCHAR)
LANGUAGE SQL
AS $$
    SELECT ID, Name
    FROM Category
    WHERE ParentCategoryID = p_category_id;
$$;

-- ============================================================
-- Тестовые данные (для отладки)
-- ============================================================

-- Пользователи
INSERT INTO "User" (Name, Email, PasswordHash, Role) VALUES
('Иван Петров', 'ivan@skmenergo.ru', 'hash1', 'admin'),
('ООО Энергия', 'info@energia.ru', 'hash2', 'client'),
('Петр Сидоров', 'petr@example.ru', 'hash3', 'client');

-- Категории
INSERT INTO Category (Name, Description, ParentCategoryID) VALUES
('Предохранители', 'Все виды предохранителей', NULL),
('Высоковольтные предохранители', 'Для сетей выше 1000В', 1),
('Низковольтные предохранители', 'Для сетей до 1000В', 1),
('Графитовые щетки', 'Щетки для электродвигателей', NULL);

-- Поставщики
INSERT INTO Supplier (Name, Type, INN, Address, ContactPerson, Phone, Email) VALUES
('ООО Электрокомплект', 'ООО', '7812345678', 'г. Москва, ул. Ленина, 1', 'Иванов Иван', '+7(495)123-45-67', 'info@electro.ru'),
('ИП Сидоров', 'ИП', '780123456789', 'г. СПб, пр. Невский, 10', 'Сидоров Петр', '+7(812)234-56-78', 'sidorov@mail.ru');

-- Товары
INSERT INTO Product (Name, Article, Price, Description, StockQuantity, CategoryID) VALUES
('Предохранитель ПКТ-10', 'PCT-10-001', 1500.00, 'Высоковольтный предохранитель 10 кВ', 100, 2),
('Щетка графитовая МГ-4', 'MG-4-002', 800.00, 'Графитовая щетка для двигателей', 50, 4),
('Предохранитель ПН-2', 'PN-2-003', 250.00, 'Низковольтный предохранитель', 200, 3);

-- Связь товар-поставщик
INSERT INTO ProductSupplier (ProductID, SupplierID) VALUES
(1, 1),
(2, 2),
(3, 1);

-- Фото
INSERT INTO Photo (URL, AltText, ProductID) VALUES
('/images/pkt10.jpg', 'Предохранитель ПКТ-10', 1),
('/images/mg4.jpg', 'Щетка МГ-4', 2);

-- Документы
INSERT INTO Document (FileName, FilePath, FileType, ProductID) VALUES
('pkt10_spec.pdf', '/docs/pkt10_spec.pdf', 'pdf', 1),
('mg4_cert.docx', '/docs/mg4_cert.docx', 'docx', 2);

-- Новости
INSERT INTO News (Title, Content, PublishDate) VALUES
('Новая поставка предохранителей', 'Поступила партия предохранителей ПКТ-10', '2025-03-01');

-- Отзывы
INSERT INTO Review (Text, Rating, UserID, ProductID) VALUES
('Отличный предохранитель, надежный', 5, 1, 1),
('Хорошая щетка, но дороговато', 4, 2, 2);

-- Заказы
INSERT INTO "Order" (CreatedAt, Status, TotalAmount, UserID) VALUES
('2025-03-10 10:00:00', 'delivered', 15000.00, 2),
('2025-03-12 12:00:00', 'new', 8000.00, 3);

-- Элементы заказов
INSERT INTO OrderItem (Quantity, PriceAtOrder, OrderID, ProductID) VALUES
(10, 1500.00, 1, 1),
(5, 800.00, 2, 2);
