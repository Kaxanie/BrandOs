insert into orgs(id,name,plan,reservation)
values ('11111111-1111-1111-1111-111111111111','Test','free',false)
on conflict do nothing;

insert into wallets(org_id,balance_cents)
values ('11111111-1111-1111-1111-111111111111', 5000)
on conflict(org_id) do update set balance_cents=excluded.balance_cents;



