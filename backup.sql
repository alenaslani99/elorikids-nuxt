PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,           -- PBKDF2 (Web Crypto, edge-safe)
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
, security_question   TEXT, security_answer_hash TEXT);
INSERT INTO "users" ("id","name","email","password_hash","created_at","security_question","security_answer_hash") VALUES(1,'Alen Aslani','nemamnick07@gmail.com','pbkdf2$100000$S7UJXJLk6MtGlG-qjwfXiw$ppE8P7gnmHFiirf8G2QkMmUji2n2ShV1PqyLiX455MI','2026-08-27 18:48:57',NULL,NULL);
INSERT INTO "users" ("id","name","email","password_hash","created_at","security_question","security_answer_hash") VALUES(2,'Jovan Cvetkovic','cvele@gmail.com','pbkdf2$100000$xUXXohj_xSsZ_gkcD2bObw$_MQjOKXcLUmOWBxZ8F5btLxyL1w0-W3Bn_-vvzGDKdo','2026-09-01 17:01:38','Koji je naziv prvog kucnog ljubimca?','pbkdf2$100000$r7CwbEw_Nd0uQ25hTGhbRg$K27lZa501mNKQW3sH757cPjkYe_wW4FAPmhNWYsU9FE');
INSERT INTO "users" ("id","name","email","password_hash","created_at","security_question","security_answer_hash") VALUES(3,'Ljubomir Živanović','ljubomirzivanovic90@gmail.com','pbkdf2$100000$03pV3YxqOFVQnhVq8e6VoA$qdFUs1Vv3T6ZtQhTQEQmBzaVh2D5cqsbbmzJegPxU7U','2026-09-12 18:06:53',NULL,NULL);
INSERT INTO "users" ("id","name","email","password_hash","created_at","security_question","security_answer_hash") VALUES(4,'Olivera Pekić','oliverajo2000@gmail.com','pbkdf2$100000$wFem4cte9UoC8B9gb-rpfg$UE-uxGRJtQZQSJFEqFIXxeZ5scc23dsYjg9fYIDGu5g','2026-11-02 10:59:39',NULL,NULL);
INSERT INTO "users" ("id","name","email","password_hash","created_at","security_question","security_answer_hash") VALUES(5,'Aleksandra Dragaš','dragasaleksandra91@gmail.com','pbkdf2$100000$zDXU89BJVN_K0YgBAj2Sxg$bfNRaHM2HLudLzY3-jL8mF7StYDgnaGF5bGLVGkWEh0','2026-11-05 19:05:14',NULL,NULL);
CREATE TABLE sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,        -- 32-byte random, base64url
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 days'))
, elevated_until TEXT);
INSERT INTO "sessions" ("id","user_id","token","created_at","expires_at","elevated_until") VALUES(16,2,'IESJYEPm5ZagWnWzk6XQlDwUCQklViNyPoKuY_2wils','2026-10-19 17:31:20','2026-11-18 17:31:20Z','2026-11-13 20:06:05');
INSERT INTO "sessions" ("id","user_id","token","created_at","expires_at","elevated_until") VALUES(18,4,'V_736qzwzMPF2v72AtDy9-yUdh3Lef1RlonfN1jmG-Q','2026-11-02 10:59:39','2026-12-02 10:59:39Z',NULL);
INSERT INTO "sessions" ("id","user_id","token","created_at","expires_at","elevated_until") VALUES(21,5,'I8kH4nLRnLsQ2835aMJMO59DNFjKljc27szizWg_d34','2026-11-05 19:05:14','2026-12-05 19:05:14Z',NULL);
CREATE TABLE newsletter_subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "newsletter_subscribers" ("id","email","created_at") VALUES(1,'nemamnick07@gmail.com','2026-09-07 13:57:55');
INSERT INTO "newsletter_subscribers" ("id","email","created_at") VALUES(2,'jovanaljubic1@gmail.com','2026-09-24 20:44:10');
INSERT INTO "newsletter_subscribers" ("id","email","created_at") VALUES(3,'spajic68@hotmail.com','2026-10-03 07:34:37');
INSERT INTO "newsletter_subscribers" ("id","email","created_at") VALUES(4,'stefanastosic418@gmail.com','2026-10-26 06:53:56');
INSERT INTO "newsletter_subscribers" ("id","email","created_at") VALUES(5,'milicaj031@gmail.com','2026-10-26 09:04:56');
INSERT INTO "newsletter_subscribers" ("id","email","created_at") VALUES(6,'oliverajo2000@gmail.com','2026-11-02 11:00:44');
INSERT INTO "newsletter_subscribers" ("id","email","created_at") VALUES(7,'drmilica90@gmail.com','2026-11-10 22:06:39');
INSERT INTO "newsletter_subscribers" ("id","email","created_at") VALUES(8,'jelenabogdanovicue@gmail.com','2026-11-11 01:05:58');
CREATE TABLE contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE rate_limits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier  TEXT NOT NULL,
  action      TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 1,
  expires_at  TEXT NOT NULL,
  UNIQUE(identifier, action)
);
INSERT INTO "rate_limits" ("id","identifier","action","count","expires_at") VALUES(133,'elevate:user:2','elevate',5,'2026-11-13 19:28:21Z');
INSERT INTO "rate_limits" ("id","identifier","action","count","expires_at") VALUES(141,'login:cvele@gmail.com:109.245.167.228','login',1,'2026-11-13 19:42:23Z');
INSERT INTO "rate_limits" ("id","identifier","action","count","expires_at") VALUES(142,'login-email:cvele@gmail.com','login',6,'2026-11-13 19:28:08Z');
CREATE TABLE orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  track_number  TEXT NOT NULL UNIQUE,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  postal        TEXT NOT NULL,
  note          TEXT,
  subtotal      INTEGER NOT NULL,
  shipping      INTEGER NOT NULL,
  grand_total   INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'received',
  received_at   TEXT,
  preparing_at  TEXT,
  in_transit_at TEXT,
  delivered_at  TEXT,
  cancelled_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
, bex_shipment_id INTEGER, bex_label_printed INTEGER N OT NULL DEFAULT 0, bex_sent_at TEXT);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(1,'EK-2026-cx09vt',NULL,'Tina Veljković','+38162585947','tina.mastilovic@gmail.com','Džona Kenedija 65/17','Beograd - Novi Beograd','11070','Ako može dostava da se preusmeri na paketomat - bila bih zahvalna',2000,350,2350,'delivered','2026-09-01 10:46:23','2026-09-02 13:15:11','2026-09-06 15:21:58','2026-09-08 10:53:15',NULL,'2026-09-01 10:46:23','2026-09-08 10:53:15',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(3,'EK-2026-n6r7nz',NULL,'Milica Lazarević','+381649568610','milica97lazarevic@gmail.com','Petra Antonijevića Baše 2','Lazarevac','11550',NULL,1800,0,1800,'delivered','2026-09-12 20:04:06','2026-09-11 22:48:28','2026-09-14 07:19:15','2026-09-15 09:09:15',NULL,'2026-09-11 18:19:55','2026-09-15 09:09:15',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(4,'EK-2026-21yx32',NULL,'Svetlana Nikolić','+381641989477','cekili87@gmail.com','Despota Stefana Lazarevića 49','Jagodina','35270',NULL,1800,0,1800,'delivered','2026-09-14 07:09:06','2026-09-14 07:08:49','2026-09-14 07:19:12','2026-09-15 09:09:13',NULL,'2026-09-14 00:15:45','2026-09-15 09:09:13',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(5,'EK-2026-bnz3zc',NULL,'Ivana Leleš','+381692777257','lelesivana90@gmail.com','Dušana Vasiljeva 74','Zrenjanin','23000',NULL,1800,0,1800,'delivered','2026-09-16 09:27:07','2026-09-17 08:49:38','2026-09-18 06:06:38','2026-09-18 12:12:41',NULL,'2026-09-16 09:27:07','2026-09-18 12:12:41',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(6,'EK-2026-p9g6a0',NULL,'Jana Koljenovic','+381691100360','jstojicevic123@gmail.com','Anri Matisa 19 19','Beograd-novi Beograd','11077',NULL,1800,0,1800,'delivered','2026-09-19 18:21:12',NULL,'2026-09-21 20:19:14','2026-09-22 09:18:45',NULL,'2026-09-19 18:21:12','2026-09-22 09:18:45',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(7,'EK-2026-uzcygn',NULL,'Ivana Ćurčić','+381621980462','ikica9226@gmail.com','Stanoje Glavasa 11','Požarevac','12000',NULL,1800,0,1800,'delivered','2026-09-24 05:19:09','2026-09-24 07:28:37',NULL,'2026-09-24 13:46:36',NULL,'2026-09-24 05:19:09','2026-09-24 13:46:36',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(8,'EK-2026-d5c6v3',NULL,'Mirjana Mladenović','+381638692095','mirjanadjuric83@yahoo.com','Zaječarska 23','Niš, Pantelej','18106',NULL,1800,0,1800,'delivered','2026-09-24 17:36:06','2026-09-27 09:46:02','2026-09-28 11:04:07','2026-09-28 11:06:17',NULL,'2026-09-24 17:36:06','2026-09-28 11:06:17',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(9,'EK-2026-bz38f6',NULL,'Valentina Savic','+381638017933','aleksicvanja91@gmail.com','Slanacki Put 76r 3','Beograd','11060',NULL,1800,0,1800,'delivered','2026-09-24 23:12:45','2026-09-27 09:46:01','2026-09-28 11:04:06','2026-09-28 11:54:20',NULL,'2026-09-24 23:12:45','2026-09-28 11:54:20',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(10,'EK-2026-2mret5',NULL,'Saša Ludman','+381631990103','sasaludman@gmail.com','Doža Đerđa 1/1 1','Ada','24430',NULL,1800,0,1800,'delivered','2026-09-27 18:19:52','2026-09-27 19:48:34','2026-09-28 11:04:04','2026-09-28 11:54:22',NULL,'2026-09-27 18:19:52','2026-09-28 11:54:22',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(11,'EK-2026-xcv4rn',NULL,'Milica Mihailovic','+381616562977','milica15.lazarevic4@gmail.com','Jovana Popovica 2','Beljina','11461',NULL,1800,0,1800,'delivered','2026-09-29 02:59:56',NULL,'2026-09-30 08:49:38','2026-10-01 09:33:59',NULL,'2026-09-29 02:59:56','2026-10-01 09:33:59',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(12,'EK-2026-1vgkdu',NULL,'Suzana Jevtic','+381628160531','suzana.petrovic500@gmail.com','Sovljak Bb 14210','Ub','14210',NULL,1800,0,1800,'delivered','2026-09-30 10:16:19','2026-10-01 09:34:16','2026-10-02 13:02:40','2026-10-03 08:01:36',NULL,'2026-09-30 10:16:19','2026-10-03 08:01:36',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(13,'EK-2026-urrund',NULL,'Milica Drakulic','+38162339279','drakulictija2@gmail.com','Kraljevacka 56','Pancevo','26000',NULL,1800,0,1800,'delivered','2026-09-30 13:28:47','2026-10-01 09:34:15','2026-10-02 13:02:39','2026-10-03-8:02:33',NULL,'2026-09-30 13:28:47','2026-10-03 08:01:35',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(14,'EK-2026-cobrnn',NULL,'Andjela Ristic','+381655537463','djorovicandjela@gmail.com','Vojvode Putnika 33','Kragujevac','34000',NULL,1800,0,1800,'delivered','2026-10-06 08:44:16','2026-10-07 07:56:56',NULL,'2026-10-14 09:24:43',NULL,'2026-10-06 08:44:16','2026-10-14 09:24:43',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(15,'EK-2026-7eayr4',NULL,'Milan Blazic','+381694664108','milicaaab92@gmail.com','Dr Bankovica 26','Lajkovac','14224',NULL,3600,0,3600,'delivered','2026-10-10 16:23:14',NULL,NULL,'2026-10-14 09:24:53',NULL,'2026-10-10 16:23:14','2026-10-14 09:24:53',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(16,'EK-2026-b9sat2',NULL,'Dragana Levnajic','+381638292540','draganalevnajiclukovski@gmail.com','Školska 4 4','Novi Sad','21102',NULL,1800,0,1800,'delivered','2026-10-22 09:15:34','2026-10-23 07:03:21','2026-10-23 09:25:42','2026-10-27 06:44:03',NULL,'2026-10-22 09:15:34','2026-10-27 06:44:03',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(17,'EK-2026-onxtjl',NULL,'Erzebet Nadj','+381654036173','turzaierzsi@gmail.com','Kratka 8','Ruski Krstur','25233',NULL,5400,0,5400,'delivered','2026-10-22 14:08:05','2026-10-23 07:03:24','2026-10-23 09:25:44','2026-10-27 06:44:05',NULL,'2026-10-22 14:08:05','2026-10-27 06:44:05',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(18,'EK-2026-0yjco7',NULL,'Jovana Gurjanov','+381638010233','jovana.lj.jovanovic@gmail.com','Ustanicka 124','Beograd','11010',NULL,1800,0,1800,'delivered','2026-10-22 23:42:38','2026-10-23 07:03:19','2026-10-23 09:25:39','2026-10-27 06:44:07',NULL,'2026-10-22 23:42:38','2026-10-27 06:44:07',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(19,'EK-2026-fk9xl3',NULL,'Tamara Kekic','+381693002704','kekictamara88@gmail.com','Čika Necina 43','Kać','21241',NULL,1800,0,1800,'delivered','2026-10-23 23:19:34','2026-10-26 06:50:08','2026-10-26 11:41:09','2026-10-27 12:25:01',NULL,'2026-10-23 23:19:34','2026-10-27 12:25:01',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(20,'EK-2026-8zoxua',NULL,'Antonela Jakovljević','+381644104760','antonellaminajakovljevic@gmail.com','Rada Đorđevića 79/79 79','Kosjerić (varoš)','31260',NULL,3600,0,3600,'delivered','2026-10-24 07:38:40','2026-10-26 06:50:06','2026-10-26 11:41:08','2026-10-27 12:25:00',NULL,'2026-10-24 07:38:40','2026-10-27 12:25:00',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(21,'EK-2026-n1pgmp',NULL,'Sanja Zrnić','+381638726263','djordjevicsanjaffm@yahoo.com','Pere Todorović 14, Stan 2 14','Beograd','11030',NULL,1800,0,1800,'delivered','2026-10-24 14:14:10','2026-10-26 06:50:05','2026-10-26 11:41:07','2026-10-27 12:24:59',NULL,'2026-10-24 14:14:10','2026-10-27 12:24:59',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(22,'EK-2026-nzhkz2',NULL,'Marija Savic','+381653889777','verasavic2711@gmail.com','Antifašističke Borbe 36','Beograd-novi Beograd','11070',NULL,3600,0,3600,'delivered','2026-10-26 22:21:33','2026-10-27 12:24:46','2026-10-27 13:56:50','2026-10-28 11:53:17',NULL,'2026-10-26 22:21:33','2026-10-28 11:53:17',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(23,'EK-2026-1j56eg',NULL,'Ivana Kostic','+38163219897','ivanakostic140@gmail.com','Volgina 8','Kaluđerica','11130','Kaludjerica a ne zvezdara 11130',3600,0,3600,'delivered','2026-10-27 10:28:37','2026-10-27 12:24:45','2026-10-27 13:56:49','2026-10-28 11:53:14',NULL,'2026-10-27 10:28:37','2026-10-28 11:53:14',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(24,'EK-2026-g8dmyr',NULL,'Milčica Janićijević','+381649329211','mkuzmanovic995@gmail.com','Pavla Savića 25','Beograd','11050',NULL,3600,0,3600,'delivered','2026-10-28 08:12:47','2026-10-29 09:41:30','2026-10-29 10:18:30','2026-10-30 06:53:56',NULL,'2026-10-28 08:12:47','2026-10-30 06:53:56',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(25,'EK-2026-wlo0wd',NULL,'Marijana Šegrt','+381653451520','marijanasegrt@gmail.com','Moše Pijade 50/13','Pančevo','26000',NULL,1800,0,1800,'delivered','2026-10-28 10:19:30','2026-10-29 09:41:29','2026-10-29 10:18:25','2026-10-30 06:53:52',NULL,'2026-10-28 10:19:30','2026-10-30 06:53:52',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(26,'EK-2026-ss5osf',NULL,'Jelena Mihajlovic','+381641192598','srdanovicjelena5@gmail.com','Dolenjska 10','Beograd','11000',NULL,3600,0,3600,'delivered','2026-10-31 08:49:58','2026-11-02 08:41:59',NULL,'2026-11-03 10:42:50',NULL,'2026-10-31 08:49:58','2026-11-03 10:42:50',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(27,'EK-2026-33utbv',4,'Olivera Pekić','+381612775956','oliverajo2000@gmail.com','Beogradska 3','Ćićevac','37210',NULL,3600,0,3600,'delivered','2026-11-02 11:00:38','2026-11-03 11:34:55','2026-11-03 17:47:29','2026-11-05 10:55:14',NULL,'2026-11-02 11:00:38','2026-11-05 10:55:14',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(28,'EK-2026-kaasas',NULL,'Milica Ranisavljevic','+38166482101','milicapavlovic1122@gmail.com','карађорђева 75 75','Jazovnik','15214',NULL,1800,0,1800,'delivered','2026-11-02 14:16:24','2026-11-03 11:34:54','2026-11-03 17:47:28','2026-11-05 10:55:17',NULL,'2026-11-02 14:16:24','2026-11-05 10:55:17',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(29,'EK-2026-du11wp',NULL,'Nemanja Stefanovic','+381613581995','dunjapejic95@gmail.com','Đure Jakšića 12 12','Alibunar','26310',NULL,3600,0,3600,'delivered','2026-11-02 14:44:51','2026-11-03 11:34:53','2026-11-03 17:47:27','2026-11-05 10:55:19',NULL,'2026-11-02 14:44:51','2026-11-05 10:55:19',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(30,'EK-2026-iy7ktt',NULL,'Dejana Djokanovic','+381641442253','dejana.jelicic@gmail.com','Zetska 26','Novi Sad','21000',NULL,1800,0,1800,'delivered','2026-11-02 18:56:22','2026-11-03 11:34:52','2026-11-03 17:47:26','2026-11-05 10:55:23',NULL,'2026-11-02 18:56:22','2026-11-05 10:55:23',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(31,'EK-2026-do5y48',NULL,'Marijana Zdravković','+38169771588','marijana.stanisic3@gmail.com','Branka Radičevića 26','Niš-palilula','18106',NULL,3600,0,3600,'delivered','2026-11-02 20:47:15','2026-11-03 11:34:51','2026-11-03 17:47:24','2026-11-05 10:55:22',NULL,'2026-11-02 20:47:15','2026-11-05 10:55:22',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(32,'EK-2026-gfbp1n',NULL,'Milica Arsic','+381621096209','milosavljevic00milica@gmail.com','Josipa Kelave 43','Kragujevac','34113',NULL,3600,0,3600,'delivered','2026-11-03 21:58:47','2026-11-04 12:46:55','2026-11-06 10:32:53','2026-11-08 08:45:29',NULL,'2026-11-03 21:58:47','2026-11-08 08:45:29',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(33,'EK-2026-nwu2m7',NULL,'Sanja Gligorov','+381640134990','sanja.gligorov@yahoo.com','Njegoševa 9 9/19','Lapovo Varoš','34220',NULL,3600,0,3600,'delivered','2026-11-04 07:58:24','2026-11-04 12:46:54','2026-11-06 10:32:52','2026-11-08 08:45:28',NULL,'2026-11-04 07:58:24','2026-11-08 08:45:28',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(34,'EK-2026-9k8g4f',NULL,'Milica Gasparevic','+381692364863','gasparevicmilica14@gmail.com','Luke Celovica Trebinjca 18','Beograd (savski Venac)','11040',NULL,3600,0,3600,'delivered','2026-11-04 20:03:11','2026-11-05 10:15:37','2026-11-06 10:32:50','2026-11-08 08:45:27',NULL,'2026-11-04 20:03:11','2026-11-08 08:45:27',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(35,'EK-2026-vab8w8',NULL,'Ognjen Jevtic','+381669725883','majagrbovic89@gmail.com','Cirpanova 2','Novi Sad','21000',NULL,5400,0,5400,'delivered','2026-11-05 07:44:16','2026-11-05 10:15:35','2026-11-06 10:32:49','2026-11-08 08:45:26',NULL,'2026-11-05 07:44:16','2026-11-08 08:45:26',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(36,'EK-2026-328tdg',NULL,'Milica Tankosić','+381621079805','milicamateric1@gmail.com','Milana Tepića 22','Veternik','21203',NULL,1800,0,1800,'delivered','2026-11-05 09:33:50','2026-11-05 10:15:34','2026-11-06 10:32:47','2026-11-08 08:45:25',NULL,'2026-11-05 09:33:50','2026-11-08 08:45:25',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(37,'EK-2026-97aau1',NULL,'Jovana Popovic','+381643671956','stojajoca1@gmail.com','Nedeljka Gvozdenovića 9/16 9/16','Beograd-novi Beograd','11070',NULL,3600,0,3600,'delivered','2026-11-05 11:47:30','2026-11-08 22:25:20',NULL,'2026-11-10 15:41:44',NULL,'2026-11-05 11:47:30','2026-11-10 15:41:44',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(38,'EK-2026-v0z7c0',5,'Aleksandra Dragaš','+381641332540','dragasaleksandra91@gmail.com','Dragiše Mišovića 30 22','Subotica','24000',NULL,1800,0,1800,'delivered','2026-11-05 19:07:01','2026-11-08 22:25:19',NULL,'2026-11-10 15:41:44',NULL,'2026-11-05 19:07:01','2026-11-10 15:41:44',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(39,'EK-2026-e6vj50',NULL,'Sandra Radovic','+381638367825','sandravesicks@gmail.com','Toplička 21 21','Kuršumlija','18430',NULL,1800,0,1800,'delivered','2026-11-05 23:39:44','2026-11-08 22:25:18',NULL,'2026-11-10 15:41:43',NULL,'2026-11-05 23:39:44','2026-11-10 15:41:43',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(40,'EK-2026-i6u3uv',NULL,'Ljiljana Šević','+38163684860','ljiljana.sevic1986@gmail.com','Branka Bajića 11b 11','Novi Sad','21137',NULL,1800,0,1800,'delivered','2026-11-06 06:56:15','2026-11-08 22:25:18',NULL,'2026-11-10 15:41:41',NULL,'2026-11-06 06:56:15','2026-11-10 15:41:41',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(41,'EK-2026-lgenql',NULL,'Maja Cvetkovic','+381616588153','majadencic1@gmail.com','Vitezova Kradjordjeve Zvezde 43a 9','Beograd','11050',NULL,1800,0,1800,'delivered','2026-11-07 06:53:40','2026-11-08 22:25:17',NULL,'2026-11-10 15:41:40',NULL,'2026-11-07 06:53:40','2026-11-10 15:41:40',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(42,'EK-2026-jo9shl',NULL,'Maja Arnautivic','+381613926876','maja97gajic@gmail.com','Ubski Put 216/216/216 216','Debrc','15214',NULL,1800,0,1800,'delivered','2026-11-07 21:39:37','2026-11-08 22:25:15',NULL,'2026-11-10 15:41:39',NULL,'2026-11-07 21:39:37','2026-11-10 15:41:39',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(43,'EK-2026-6arkpq',NULL,'Jovana Ranisavljevic','+381640087627','joka.tresnja@gmail.com','Vranjska 2 2','Beograd-zvezdara','11050','Dostava od 11-16h',3600,0,3600,'delivered','2026-11-08 08:17:40','2026-11-08 22:25:14',NULL,'2026-11-10 15:41:38',NULL,'2026-11-08 08:17:40','2026-11-10 15:41:38',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(44,'EK-2026-cavv6m',NULL,'Tatjana Mijovic','+381637467853','tmijovic@gmail.com','Vladimira Tomanovica 45','Beograd-voždovac','11000',NULL,5400,0,5400,'delivered','2026-11-08 11:14:49','2026-11-08 22:25:13',NULL,'2026-11-10 15:41:37',NULL,'2026-11-08 11:14:49','2026-11-10 15:41:37',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(45,'EK-2026-dckmhb',NULL,'Jovana Lekic','+38162446532','jovana544@gmail.com','16. Oktobra 5/49','Beograd Zvezdara','11160',NULL,1800,0,1800,'delivered','2026-11-08 11:45:19','2026-11-08 22:25:12',NULL,'2026-11-10 15:41:36',NULL,'2026-11-08 11:45:19','2026-11-10 15:41:36',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(46,'EK-2026-w496gh',NULL,'Zaida Djakovac','+381694045556','zaidadjakovac@gmail.com','42/9 Sprat 22','Novi Pazar','36300',NULL,5400,0,5400,'delivered','2026-11-08 13:07:15','2026-11-08 22:25:10',NULL,'2026-11-10 15:41:35',NULL,'2026-11-08 13:07:15','2026-11-10 15:41:35',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(47,'EK-2026-umwn8b',NULL,'Snezana Memarović','+381644641800','snezana.zivkovic96@gmail.com','Živka Živkovića 32 Đ/32đ 32','Leštane','11309',NULL,3600,0,3600,'delivered','2026-11-08 20:22:04','2026-11-08 22:25:09',NULL,'2026-11-10 15:41:33',NULL,'2026-11-08 20:22:04','2026-11-10 15:41:33',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(48,'EK-2026-5hwiko',NULL,'Tamara Gligorijevic','+381638676700','stefanovictaki97@gmail.com','Vuka Karadžića 12/12/12 12','Požarevac','12000',NULL,1800,0,1800,'delivered','2026-11-10 06:56:22','2026-11-12 08:17:14',NULL,'2026-11-12 11:43:41',NULL,'2026-11-10 06:56:22','2026-11-12 11:43:41',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(49,'EK-2026-s2olqu',NULL,'Semir Hadzic','+381666611113','semir_kick@hotmail.com','Lukavica 66','Tutin','36320',NULL,1800,0,1800,'delivered','2026-11-10 06:57:56','2026-11-12 08:17:13',NULL,'2026-11-12 11:43:40',NULL,'2026-11-10 06:57:56','2026-11-12 11:43:40',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(50,'EK-2026-bs8vmx',NULL,'Zeljka Rakic','+381649263269','zeljka.m97@gmail.com','Svete Popovića 19','Ub','14210',NULL,1800,0,1800,'delivered','2026-11-10 20:20:37','2026-11-12 08:17:12',NULL,'2026-11-12 11:43:39',NULL,'2026-11-10 20:20:37','2026-11-12 11:43:39',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(51,'EK-2026-poyeo3',NULL,'Milica Bantulic','+381645134199','drmilica90@gmail.com','Koste Todorovic 6','Beograd Savski Venac','11040','Prva Hirurška Klinika UKCS',1800,0,1800,'delivered','2026-11-10 22:07:01','2026-11-12 08:17:10',NULL,'2026-11-12 11:43:38',NULL,'2026-11-10 22:07:01','2026-11-12 11:43:38',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(52,'EK-2026-m2x8ma',NULL,'Mila Malešev','+381631091202','milamalesev@gmail.com','Braće Ribnikar 29/29/29 29','Novi Sad','21102',NULL,3600,0,3600,'delivered','2026-11-12 09:31:48','2026-11-12 11:43:30',NULL,'2026-11-12 11:43:36',NULL,'2026-11-12 09:31:48','2026-11-12 11:43:36',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(53,'EK-2026-e2pmo7',NULL,'Milena Kojčić','+381655143512','mobrenovic55@gmail.com','Kopaonicka 1 1/28','Cukarica','11030',NULL,1800,0,1800,'received','2026-11-12 21:49:37',NULL,NULL,NULL,NULL,'2026-11-12 21:49:37','2026-11-12 21:49:37',NULL,0,NULL);
INSERT INTO "orders" ("id","track_number","user_id","customer_name","phone","email","address","city","postal","note","subtotal","shipping","grand_total","status","received_at","preparing_at","in_transit_at","delivered_at","cancelled_at","created_at","updated_at","bex_shipment_id","bex_label_printed","bex_sent_at") VALUES(54,'EK-2026-h7xglc',NULL,'Kristina Beretic','+381616717929','lebovick17@gmail.com','Bunjevačka 18','Bajmok','24210',NULL,1800,0,1800,'received','2026-11-13 07:45:56',NULL,NULL,NULL,NULL,'2026-11-13 07:45:56','2026-11-13 07:45:56',NULL,0,NULL);
CREATE TABLE order_items (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id  INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  slug      TEXT NOT NULL,
  title     TEXT NOT NULL,
  price     INTEGER NOT NULL,
  quantity  INTEGER NOT NULL
, product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, unit_cost INTEGER);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(1,1,'prvi-koraci','Prvi koraci',2000,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(3,3,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(4,4,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(5,5,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(6,6,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(7,7,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(8,8,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(9,9,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(10,10,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(11,11,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(12,12,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(13,13,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(14,14,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(15,15,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(16,15,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(17,16,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(18,17,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(19,17,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(20,17,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(21,18,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(22,19,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(23,20,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(24,20,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(25,21,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(26,22,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(27,22,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(28,23,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(29,23,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(30,24,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(31,24,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(32,25,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(33,26,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(34,26,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(35,27,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(36,27,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(37,28,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(38,29,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(39,29,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(40,30,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(41,31,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(42,31,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(43,32,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(44,32,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(45,33,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(46,33,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(47,34,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(48,34,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(49,35,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(50,35,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(51,35,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(52,36,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(53,37,'ucimo-kroz-igru','Učimo kroz igru',1800,2,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(54,38,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(55,39,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(56,40,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(57,41,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(58,42,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(59,43,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(60,43,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(61,44,'ucimo-kroz-igru','Učimo kroz igru',1800,3,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(62,45,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(63,46,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(64,46,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(65,46,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(66,47,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(67,47,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(68,48,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(69,49,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(70,50,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(71,51,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(72,52,'prvi-koraci','Prvi koraci',1800,1,1,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(73,52,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(74,53,'ucimo-kroz-igru','Učimo kroz igru',1800,1,2,470);
INSERT INTO "order_items" ("id","order_id","slug","title","price","quantity","product_id","unit_cost") VALUES(75,54,'priprema-za-skolu','Priprema za školu',1800,1,3,470);
CREATE TABLE categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  parent_id  INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "categories" ("id","slug","name","parent_id","sort_order","created_at") VALUES(1,'knjige','Knjige',NULL,0,'2026-08-26 12:52:54');
CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
, subtitle TEXT, description TEXT, badge TEXT, accent TEXT NOT NULL DEFAULT 'mint'
  CHECK (accent IN ('mint', 'purple', 'coral')), age_group_id INTEGER REFERENCES age_groups(id) ON DELETE SET NULL, sort_order INTEGER NOT NULL DEFAULT 0, cost INTEGER);
INSERT INTO "products" ("id","slug","title","category_id","active","created_at","updated_at","subtitle","description","badge","accent","age_group_id","sort_order","cost") VALUES(1,'prvi-koraci','Prvi koraci',1,1,'2026-08-26 12:52:54','2026-11-13 19:09:56','Boje, veličine i životinje za najmlađe istraživače','Idealna prva radna sveska za najmlađe. Kroz šarene ilustracije i jednostavne zadatke, dete upoznaje boje, veličine i životinje. Svaka stranica je prilagođena malim rukama i razvija osnove logičkog razmišljanja kroz igru.','Najmlađima','mint',1,0,470);
INSERT INTO "products" ("id","slug","title","category_id","active","created_at","updated_at","subtitle","description","badge","accent","age_group_id","sort_order","cost") VALUES(2,'ucimo-kroz-igru','Učimo kroz igru',1,1,'2026-08-26 12:52:54','2026-11-13 19:09:38','Sortiranje, grupisanje i logičke veze','Knjiga koja razvija sposobnost sortiranja, grupisanja i povezivanja. Kroz zanimljive zadatke sa voćem, povrćem, igračkama i životinjama, dete uči da prepoznaje šta pripada gde i kako stvari idu zajedno.','Razvoj logike','purple',2,1,470);
INSERT INTO "products" ("id","slug","title","category_id","active","created_at","updated_at","subtitle","description","badge","accent","age_group_id","sort_order","cost") VALUES(3,'priprema-za-skolu','Priprema za školu',1,1,'2026-08-26 12:52:54','2026-11-13 19:11:41','Lavirinti, logika i koncentracija za buduće đake','Poslednja knjiga u seriji - priprema za polazak u školu. Lavirinti, pronalaženje razlika i asocijacije razvijaju strpljenje, pažnju i logičko razmišljanje. Sve što dete treba da savlada pre prvog školskog zvona.','Školski start','coral',3,2,470);
CREATE TABLE product_prices (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount         INTEGER NOT NULL,                  -- RSD, integer
  is_sale        INTEGER NOT NULL DEFAULT 0,        -- 1 = sale price
  effective_from TEXT NOT NULL DEFAULT (datetime('now')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "product_prices" ("id","product_id","amount","is_sale","effective_from","created_at") VALUES(1,1,2000,0,'2026-08-26 12:52:54','2026-08-26 12:52:54');
INSERT INTO "product_prices" ("id","product_id","amount","is_sale","effective_from","created_at") VALUES(2,2,2000,0,'2026-08-26 12:52:54','2026-08-26 12:52:54');
INSERT INTO "product_prices" ("id","product_id","amount","is_sale","effective_from","created_at") VALUES(3,3,2000,0,'2026-08-26 12:52:54','2026-08-26 12:52:54');
INSERT INTO "product_prices" ("id","product_id","amount","is_sale","effective_from","created_at") VALUES(4,3,1800,1,'2026-09-08 11:12:20','2026-09-08 11:12:20');
INSERT INTO "product_prices" ("id","product_id","amount","is_sale","effective_from","created_at") VALUES(5,1,1800,1,'2026-09-08 11:12:20','2026-09-08 11:12:20');
INSERT INTO "product_prices" ("id","product_id","amount","is_sale","effective_from","created_at") VALUES(6,2,1800,1,'2026-09-08 11:12:20','2026-09-08 11:12:20');
CREATE TABLE product_images (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL DEFAULT 'image' CHECK (kind IN ('image', 'video')),
  r2_key       TEXT NOT NULL UNIQUE,
  poster_key   TEXT,
  alt          TEXT,
  content_type TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "product_images" ("id","product_id","kind","r2_key","poster_key","alt","content_type","size_bytes","sort_order","created_at") VALUES(1,1,'video','prvi-koraci.mp4','prvi-koraci-poster.jpg','Pregled knjige Prvi koraci','video/mp4',5236704,0,'2026-11-04 19:55:43');
INSERT INTO "product_images" ("id","product_id","kind","r2_key","poster_key","alt","content_type","size_bytes","sort_order","created_at") VALUES(2,1,'image','prvi-koraci.jpeg',NULL,'Naslovna strana - Prvi koraci','image/jpeg',310515,1,'2026-11-04 19:55:43');
INSERT INTO "product_images" ("id","product_id","kind","r2_key","poster_key","alt","content_type","size_bytes","sort_order","created_at") VALUES(3,2,'video','ucimo-kroz-igru.mp4','ucimo-kroz-igru-poster.jpg','Pregled knjige Učimo kroz igru','video/mp4',5162355,0,'2026-11-04 19:55:43');
INSERT INTO "product_images" ("id","product_id","kind","r2_key","poster_key","alt","content_type","size_bytes","sort_order","created_at") VALUES(4,2,'image','ucimo-kroz-igru.jpeg',NULL,'Naslovna strana - Učimo kroz igru','image/jpeg',307413,1,'2026-11-04 19:55:43');
INSERT INTO "product_images" ("id","product_id","kind","r2_key","poster_key","alt","content_type","size_bytes","sort_order","created_at") VALUES(5,3,'video','priprema-za-skolu.mp4','priprema-za-skolu-poster.jpg','Pregled knjige Priprema za školu','video/mp4',4755582,0,'2026-11-04 19:55:43');
INSERT INTO "product_images" ("id","product_id","kind","r2_key","poster_key","alt","content_type","size_bytes","sort_order","created_at") VALUES(6,3,'image','priprema-za-skolu.jpeg',NULL,'Naslovna strana - Priprema za školu','image/jpeg',301665,1,'2026-11-04 19:55:43');
CREATE TABLE age_groups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "age_groups" ("id","slug","label","sort_order") VALUES(1,'2-3-godine','2–3 godine',0);
INSERT INTO "age_groups" ("id","slug","label","sort_order") VALUES(2,'3-4-godine','3–4 godine',1);
INSERT INTO "age_groups" ("id","slug","label","sort_order") VALUES(3,'4-6-godine','4–6 godine',2);
CREATE TABLE product_features (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(29,2,'24 stranice',0);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(30,2,'Laminirano',1);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(31,2,'Vodootporno',2);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(32,2,'Piši-briši',3);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(33,1,'24 stranice',0);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(34,1,'Laminirano',1);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(35,1,'Vodootporno',2);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(36,1,'Piši-briši',3);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(37,3,'24 stranice',0);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(38,3,'Laminirano',1);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(39,3,'Vodootporno',2);
INSERT INTO "product_features" ("id","product_id","label","sort_order") VALUES(40,3,'Piši-briši',3);
CREATE TABLE product_activities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(29,2,'Sortiranje','Sortiranje voća i povrća, prepoznavanje šta pripada gde.',0);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(30,2,'Kategorije','Grupisanje predmeta po tipu (igračke, odeća, hrana, ...).',1);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(31,2,'Povezivanje','Uparivanje parova životinja, predmeta i pojmova.',2);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(32,2,'Logika','Zadaci zaključivanja, pronalaženje šema za razvoj mišljenja.',3);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(33,1,'Svet boja','Uparivanje predmeta sa bojama (sunce je žuto, list je zelen).',0);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(34,1,'Veliko i malo','Poređenje veličina kroz svakodnevne i životinjske primere.',1);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(35,1,'Životinje','Domaće i divlje životinje, uparivanje roditelja i mladunaca.',2);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(36,1,'Uparivanje','Pronalaženje parova i uparivanje sličnih predmeta za logiku.',3);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(37,3,'Lavirinti','Pronalaženje pravog puta razvija strpljenje i logičko razmišljanje.',0);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(38,3,'Pronađi razlike','Upoređivanje slika jača pažnju i vizuelnu percepciju.',1);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(39,3,'Asocijacije','Povezivanje predmeta koji idu zajedno (četkica+pasta, ključ+vrata).',2);
INSERT INTO "product_activities" ("id","product_id","title","description","sort_order") VALUES(40,3,'Koncentracija','Zadaci fokusa koji pripremaju za školske obaveze.',3);
CREATE TABLE product_selling_points (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(29,2,'Piši-briši sistem','Laminirane, vodootporne stranice omogućavaju višestruko korišćenje. Dete može da vežba isti zadatak bezbroj puta, bez straha od greške. Jednostavno obrišite i počnite ispočetka!',0);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(30,2,'Originalni sadržaj','Svaki zadatak je pažljivo osmišljen i ručno ilustrovan. Nema kopiranih materijala - sve je kreirano sa ljubavlju, prilagođeno našoj deci i njihovim potrebama.',1);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(31,2,'Učenje kroz igru','Zabava je na prvom mestu - učenje dolazi prirodno. Šareni zadaci, simpatične ilustracije i raznovrsne aktivnosti drže pažnju mališana dok nesvesno usvajaju nova znanja.',2);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(32,2,'24 stranice','Raznovrsni zadaci koji podstiču kreativnost i radoznalost.',3);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(33,1,'Piši-briši sistem','Laminirane, vodootporne stranice omogućavaju višestruko korišćenje. Dete može da vežba isti zadatak bezbroj puta, bez straha od greške. Jednostavno obrišite i počnite ispočetka!',0);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(34,1,'Originalni sadržaj','Svaki zadatak je pažljivo osmišljen i ručno ilustrovan. Nema kopiranih materijala - sve je kreirano sa ljubavlju, prilagođeno našoj deci i njihovim potrebama.',1);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(35,1,'Učenje kroz igru','Zabava je na prvom mestu - učenje dolazi prirodno. Šareni zadaci, simpatične ilustracije i raznovrsne aktivnosti drže pažnju mališana dok nesvesno usvajaju nova znanja.',2);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(36,1,'24 stranice','Raznovrsni zadaci koji podstiču kreativnost i radoznalost.',3);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(37,3,'Piši-briši sistem','Laminirane, vodootporne stranice omogućavaju višestruko korišćenje. Dete može da vežba isti zadatak bezbroj puta, bez straha od greške. Jednostavno obrišite i počnite ispočetka!',0);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(38,3,'Originalni sadržaj','Svaki zadatak je pažljivo osmišljen i ručno ilustrovan. Nema kopiranih materijala - sve je kreirano sa ljubavlju, prilagođeno našoj deci i njihovim potrebama.',1);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(39,3,'Učenje kroz igru','Zabava je na prvom mestu - učenje dolazi prirodno. Šareni zadaci, simpatične ilustracije i raznovrsne aktivnosti drže pažnju mališana dok nesvesno usvajaju nova znanja.',2);
INSERT INTO "product_selling_points" ("id","product_id","title","body","sort_order") VALUES(40,3,'24 stranice','Raznovrsni zadaci koji podstiču kreativnost i radoznalost.',3);
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "settings" ("key","value","updated_at") VALUES('catalog_version','8','2026-11-13 19:11:41');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('rate_limits',142);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('categories',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('products',4);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('product_prices',7);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',5);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('sessions',25);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('orders',54);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('order_items',75);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('newsletter_subscribers',8);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('product_images',7);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('age_groups',3);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('product_features',40);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('product_activities',40);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('product_selling_points',40);
CREATE INDEX idx_sessions_token   ON sessions(token);
CREATE INDEX idx_sessions_user   ON sessions(user_id);
CREATE INDEX idx_rate_limits_lookup ON rate_limits(identifier, action);
CREATE INDEX idx_rate_limits_expiry  ON rate_limits(expires_at);
CREATE INDEX idx_orders_user         ON orders(user_id);
CREATE INDEX idx_orders_email        ON orders(email);
CREATE INDEX idx_orders_track_number ON orders(track_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active   ON products(active);
CREATE INDEX idx_prices_current
  ON product_prices(product_id, effective_from DESC, id DESC);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_product_images_product ON product_images(product_id, sort_order);
CREATE INDEX idx_products_age_group ON products(age_group_id);
CREATE INDEX idx_products_sort      ON products(sort_order, id);
CREATE INDEX idx_product_features_product ON product_features(product_id, sort_order);
CREATE INDEX idx_product_activities_product ON product_activities(product_id, sort_order);
CREATE INDEX idx_product_selling_points_product ON product_selling_points(product_id, sort_order);
CREATE VIEW v_storefront_products AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.subtitle,
  p.description,
  p.badge,
  p.accent,
  p.active,
  p.sort_order,
  c.slug  AS category_slug,
  c.name  AS category_name,
  ag.slug AS age_slug,
  ag.label AS age_label,
  cur.amount  AS price,
  cur.is_sale AS is_sale,
  (SELECT amount FROM product_prices
   WHERE product_id = p.id AND is_sale = 0 AND effective_from <= datetime('now')
   ORDER BY effective_from DESC, id DESC LIMIT 1) AS regular_price,
  (SELECT r2_key FROM product_images
   WHERE product_id = p.id AND kind = 'image'
   ORDER BY sort_order, id LIMIT 1) AS cover_key
FROM products p
LEFT JOIN categories c  ON c.id = p.category_id
LEFT JOIN age_groups ag ON ag.id = p.age_group_id
LEFT JOIN product_prices cur ON cur.id = (
  SELECT id FROM product_prices
  WHERE product_id = p.id AND effective_from <= datetime('now')
  ORDER BY effective_from DESC, id DESC LIMIT 1
);
