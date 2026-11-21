create table if not exists profiles (
  user_id text primary key,
  username text unique,
  display_name text not null default '',
  bio text not null default '',
  avatar text,
  gender text,
  show_gender boolean not null default false,
  birth_year int,
  age_confirmed boolean not null default false,
  allow_mature boolean not null default false,
  theme text not null default 'system',
  role text not null default 'user',
  notif_invites boolean not null default true,
  notif_games boolean not null default true,
  notif_turns boolean not null default true,
  notif_daily boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists connections (
  id text primary key,
  requester_id text not null,
  recipient_id text not null,
  status text not null,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  connected_at timestamptz
);

create unique index if not exists connections_open_pair
  on connections ((least(requester_id, recipient_id)), (greatest(requester_id, recipient_id)))
  where status in ('pending', 'accepted');

create index if not exists connections_recipient_idx on connections (recipient_id, status);

create table if not exists email_invites (
  id text primary key,
  from_user_id text not null,
  email text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create unique index if not exists email_invites_pending_idx
  on email_invites (from_user_id, email)
  where status = 'pending';

create table if not exists questions (
  id text primary key,
  text text not null,
  category text not null,
  difficulty text not null,
  answer_type text not null,
  choices text not null default '[]',
  sensitivity text not null default 'low',
  audience text not null default 'all',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists questions_category_idx on questions (category, active);

create table if not exists games (
  id text primary key,
  player_a text not null,
  player_b text not null,
  category text not null,
  mode text not null,
  status text not null,
  current_index int not null default 0,
  question_ids text not null,
  created_by text not null,
  seen_a boolean not null default false,
  seen_b boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists games_player_a_idx on games (player_a, updated_at desc);
create index if not exists games_player_b_idx on games (player_b, updated_at desc);

create table if not exists answers (
  id text primary key,
  game_id text not null,
  position int not null,
  user_id text not null,
  body text not null default '',
  choice_index int,
  prediction text,
  prediction_index int,
  skipped boolean not null default false,
  created_at timestamptz not null default now(),
  unique (game_id, position, user_id)
);

create table if not exists reactions (
  game_id text not null,
  position int not null,
  user_id text not null,
  kind text not null,
  created_at timestamptz not null default now(),
  primary key (game_id, position, user_id)
);

create table if not exists favorite_questions (
  user_id text not null,
  question_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists favorite_answers (
  user_id text not null,
  answer_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, answer_id)
);

create table if not exists notes (
  id text primary key,
  author_id text not null,
  partner_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists notes_pair_idx on notes (author_id, partner_id);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

create table if not exists activity_days (
  user_id text not null,
  day date not null,
  primary key (user_id, day)
);

create table if not exists daily_picks (
  day date primary key,
  question_id text not null
);

create table if not exists daily_answers (
  user_id text not null,
  day date not null,
  question_id text not null,
  body text not null default '',
  choice_index int,
  skipped boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table if not exists couple_challenges (
  pair_key text not null,
  day date not null,
  title text not null,
  done boolean not null default false,
  done_by text,
  primary key (pair_key, day)
);

create table if not exists reports (
  id text primary key,
  reporter_id text not null,
  question_id text,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists announcements (
  id text primary key,
  title text not null,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists error_logs (
  id text primary key,
  user_id text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists password_resets (
  id text primary key,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false
);
