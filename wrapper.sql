-- USER ROLE
insert into role(`name`,`createdAt`,`updatedAt`) values 
('ADMIN',now(),now()), 
('USER',now(),now()), 
('DEVELOPER',now(),now());

-- CATEGORY
insert into video_category(`name`,`createdAt`,`updatedAt`) values 
('SOLUTIONS',now(),now()),
('PEACE',now(),now()),
('HEALING',now(),now()),
('SCIENCE',now(),now()),
('TECHNOLOGY',now(),now()),
('DEBT',now(),now()),
('TAXES',now(),now()),
('LIBERATION',now(),now()),
('MUSIC',now(),now()),
('MEDIA',now(),now()),
('HUMOR',now(),now());


-- VIDEOS_VIEW

 create view video_view as select v.name as videoTitle,v.hash,v.description, v.active, v.visibility, cat.name category, 
 concat(u.firstName,' ',u.lastName) as createdBy,v.createdAt, u.id as userId, v.id as videoId, v.poster, 
 (select count(l.id) from likes l where l.videoId=v.id and l.active=1) as likes, 
 (select count(vw.id) from views vw where vw.active=1 and vw.videoId=v.id) as views, v.status, c.id as channelId, c.name as channelTitle 
 from video v 
 left join channel c on c.id=v.channelId 
 left join user u on u.id=v.userId 
 left join video_category cat on cat.id=v.categoryId 
 where c.active=1 and c.visibility=1 and v.active=1 and c.visibility=1 and v.status='PUBLISHED';


-- channel_VIEW
create view channel_view as select c.name as channelTitle, c.description, c.userId as userId, c.id as channelId,
concat(u.firstName,' ',u.lastName) as createdBy, c.createdAt, c.active, c.visibility, c.status, c.channelArt,
(select count(s.id) from subscription s where s.active=1 and s.channelId = c.id) as subscribes,
(select count(v.id) from video v where v.channelId=c.id and v.status='PUBLISHED' and v.active=1 and v.visibility=1) as videos 
from channel c 
left join user u on u.id = c.userId 
where c.active=1 and c.visibility=1 and c.status = 'PUBLISHED'; 