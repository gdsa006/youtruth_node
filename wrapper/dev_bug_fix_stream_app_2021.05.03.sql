alter table video add column duration double(5,2) after description;
alter table video_format change column meta meta text;
alter table video_category add column fontAwesomeClass varchar(100) after name;
alter table user change column status status enum('BLOCKED','INACTIVE','ACTIVE','PENDING');

alter table user_otp add column type enum('SIGNUP', 'UPDATE_PASSWORD') after otp;
alter table user_otp change column expiryTime expiryTime int(2) default 15;
alter table video_audit add column poster varchar(255) after visibility;