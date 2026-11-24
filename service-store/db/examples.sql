-- The three example projects from the design. The studio can remove them with one button.
DELETE FROM projects WHERE example = 1;
INSERT INTO projects (code, order_code, service_id, name, detail, client, company, email, stage, round, resource, total, paid, monthly, example, due_at, created_at) VALUES
('PRJ-DEMO1','ORD-DEMO1','social20','Monthly Plan · Growth','December content','Aarav Menon','Greenleaf Organics','aarav@example.com',4,1,'Senior Graphic Designer 2',53100,53100,1,1,NOW() + INTERVAL 3 DAY,NOW() - INTERVAL 12 DAY),
('PRJ-DEMO2','ORD-DEMO2','logo','Logo Design','Signature: 4 concepts + monogram + favicon','Nisha Rao','Kaapi Kottai Café','nisha@example.com',2,0,'Senior Graphic Designer 1',41300,20650,0,1,NOW() + INTERVAL 3 DAY,NOW() - INTERVAL 4 DAY),
('PRJ-DEMO3','ORD-DEMO3','v30','30-Second Video','2D motion graphics · Professional voice-over (1 language)','Dr. Suresh Pillai','Pillai Dental Care','suresh@example.com',0,0,'Unassigned',60180,30090,0,1,NOW() + INTERVAL 9 DAY,NOW() - INTERVAL 1 DAY);
INSERT INTO briefs (project_id, goal, audience, content, refs, assets) SELECT id,'Grow Instagram following ahead of the winter range launch','Urban families, 28 to 45','Winter range, recipes, farm stories','@goodearth, @thewholetruthfoods','Have logo & guidelines' FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO briefs (project_id, goal, audience, content, refs, assets) SELECT id,'Logo for a filter-coffee café in Indiranagar','Young professionals and students','Name: Kaapi Kottai. Warm, South Indian, not kitsch','Brass tumblers, old Madras signage','Starting fresh' FROM projects WHERE code='PRJ-DEMO2';
INSERT INTO files (project_id, kind, name, round, status, created_at) SELECT id,'draft','Greenleaf_Dec_Calendar_SCA_D1.pdf',0,'changes',NOW() - INTERVAL 6 DAY FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO files (project_id, kind, name, round, status, created_at) SELECT id,'draft','Greenleaf_Dec_Posts_SCA_D2.pdf',1,'pending',NOW() - INTERVAL 1 DAY FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO messages (project_id, sender, body, created_at) SELECT id,'studio','Draft 2 is up with the recipe carousels reworked as you asked.',NOW() - INTERVAL 1 DAY FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO activity (project_id, body, created_at) SELECT id,'Order paid in full',NOW() - INTERVAL 12 DAY FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO activity (project_id, body, created_at) SELECT id,'Brief submitted',NOW() - INTERVAL 11 DAY FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO activity (project_id, body, created_at) SELECT id,'First cut shared',NOW() - INTERVAL 6 DAY FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO activity (project_id, body, created_at) SELECT id,'Corrections requested (round 1 of 4)',NOW() - INTERVAL 4 DAY FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO activity (project_id, body, created_at) SELECT id,'Draft 2 shared for review',NOW() - INTERVAL 1 DAY FROM projects WHERE code='PRJ-DEMO1';
INSERT INTO activity (project_id, body, created_at) SELECT id,'50% advance paid',NOW() - INTERVAL 4 DAY FROM projects WHERE code='PRJ-DEMO2';
INSERT INTO activity (project_id, body, created_at) SELECT id,'Brief submitted',NOW() - INTERVAL 4 DAY FROM projects WHERE code='PRJ-DEMO2';
INSERT INTO activity (project_id, body, created_at) SELECT id,'Kick-off call done',NOW() - INTERVAL 3 DAY FROM projects WHERE code='PRJ-DEMO2';
INSERT INTO activity (project_id, body, created_at) SELECT id,'50% advance paid',NOW() - INTERVAL 1 DAY FROM projects WHERE code='PRJ-DEMO3';
