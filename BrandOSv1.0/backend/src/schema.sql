create table if not exists orgs(
  id uuid primary key, name text not null,
  plan text not null default 'free',
  reservation boolean not null default false,
  created_at timestamp not null default now()
);

create table if not exists wallets(
  org_id uuid primary key references orgs(id),
  balance_cents int not null default 0,
  updated_at timestamp not null default now()
);

create table if not exists wallet_ledger(
  id uuid primary key,
  org_id uuid not null references orgs(id),
  kind text not null,
  amount_cents int not null,
  meta jsonb not null default '{}',
  created_at timestamp not null default now()
);

create table if not exists subscriptions(
  org_id uuid primary key references orgs(id),
  plan text not null,
  start_at timestamp not null,
  renews_at timestamp not null,
  included_std_exports int not null,
  rollover_std_exports int not null default 0,
  last_reset timestamp not null default now()
);

create table if not exists usage_monthly(
  org_id uuid not null references orgs(id),
  y int not null, m int not null,
  finals_medium int not null default 0,
  finals_low int not null default 0,
  finals_high int not null default 0,
  previews_low int not null default 0,
  primary key (org_id,y,m)
);

create table if not exists gen_cache(
  org_id uuid not null references orgs(id),
  key_sha256 char(64) not null,
  image_b64 text not null,
  created_at timestamp not null default now(),
  primary key (org_id, key_sha256)
);

create table if not exists runs(
  id uuid primary key,
  org_id uuid not null references orgs(id),
  quality text not null,
  aspect text not null,
  n int not null,
  mode text not null,
  price_cents int not null,
  prompt_sha256 char(64) not null,
  created_at timestamp not null default now()
);

create table if not exists pay_intents(
  id uuid primary key,
  org_id uuid not null references orgs(id),
  run_key char(64) not null,
  amount_cents int not null,
  provider text not null,
  provider_ref text not null,
  status text not null,
  created_at timestamp not null default now()
);

