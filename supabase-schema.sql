insert into profiles (id, display_name, role)
values ('e4e8a1c3-1e1b-47c7-b71b-edc203ebe931', 'Admin', 'admin')
on conflict (id) do update set role = 'admin';
