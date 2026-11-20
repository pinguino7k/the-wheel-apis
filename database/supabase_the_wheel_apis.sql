-- =====================================================================
-- The Wheel - Tablas de Supabase (PostgreSQL) para las APIs RESTful
-- Ejecutar en Supabase > SQL Editor > New query > Run
-- Cada tabla equivale a una coleccion de MongoDB (BD the_wheel):
--   * los campos simples son columnas
--   * los subdocumentos (objetos y arreglos de objetos) son columnas jsonb
--   * DETAIL_ROW se guarda en las columnas de auditoria del sistema del grupo
-- La tabla zt_usuarios ya existe (actividad de GraphQL) y se usa para el login.
-- =====================================================================

-- 1. Ciclos de The Wheel (coleccion active_wheels)
create table if not exists public.zt_active_wheels (
  wheel_id        varchar(8)   primary key check (wheel_id ~ '^WHL-[0-9]{4}$'),
  symbol          varchar(10)  not null,
  broker          jsonb        not null,
  phase           varchar(10)  not null check (phase in ('CSP','ASSIGNED','CC','CLOSED')),
  status          varchar(10)  not null check (status in ('ACTIVE','FINISHED','CANCELED')),
  start_date      timestamptz  not null,
  end_date        timestamptz,
  capital         jsonb,
  position        jsonb,
  contracts       jsonb        not null default '[]'::jsonb,
  stock_orders    jsonb        not null default '[]'::jsonb,
  phase_history   jsonb        not null default '[]'::jsonb,
  metrics         jsonb,
  actived         boolean      not null default true,
  deleted         boolean      not null default false,
  detail_row_reg  jsonb        not null default '[]'::jsonb,
  reguser         varchar(30),
  regdate         timestamptz  default now(),
  moduser         varchar(30),
  moddate         timestamptz
);

-- 2. Analisis tecnico y financiero (coleccion market_analysis)
create table if not exists public.zt_market_analysis (
  id              varchar(24)  primary key,
  symbol          varchar(10)  not null,
  date            timestamptz  not null,
  instrument      jsonb,
  technical       jsonb        not null,
  financial       jsonb        not null,
  actived         boolean      not null default true,
  deleted         boolean      not null default false,
  detail_row_reg  jsonb        not null default '[]'::jsonb,
  reguser         varchar(30),
  regdate         timestamptz  default now(),
  moduser         varchar(30),
  moddate         timestamptz
);

-- 3. Indices de mercado (coleccion market_indices)
create table if not exists public.zt_market_indices (
  id              varchar(24)  primary key,
  date            timestamptz  not null,
  indices         jsonb        not null default '[]'::jsonb,
  risk_level      varchar(6)   not null check (risk_level in ('LOW','MEDIUM','HIGH')),
  trading_allowed boolean      not null default true,
  actived         boolean      not null default true,
  deleted         boolean      not null default false,
  detail_row_reg  jsonb        not null default '[]'::jsonb,
  reguser         varchar(30),
  regdate         timestamptz  default now(),
  moduser         varchar(30),
  moddate         timestamptz
);

-- 4. Noticias y sentimiento (coleccion news_sentiment)
create table if not exists public.zt_news_sentiment (
  id              varchar(24)  primary key,
  symbol          varchar(10),
  published_at    timestamptz  not null,
  source          varchar(80)  not null,
  headline        text         not null,
  url             text,
  sentiment       jsonb        not null,
  event           jsonb,
  blocks_trading  boolean      not null default false,
  actived         boolean      not null default true,
  deleted         boolean      not null default false,
  detail_row_reg  jsonb        not null default '[]'::jsonb,
  reguser         varchar(30),
  regdate         timestamptz  default now(),
  moduser         varchar(30),
  moddate         timestamptz
);

-- 5. Configuracion de la estrategia (coleccion wheel_config)
create table if not exists public.zt_wheel_config (
  scope           varchar(10)  primary key,
  universe        jsonb,
  brokers         jsonb,
  option_rules    jsonb        not null,
  filters         jsonb        not null,
  risk            jsonb,
  actived         boolean      not null default true,
  deleted         boolean      not null default false,
  detail_row_reg  jsonb        not null default '[]'::jsonb,
  reguser         varchar(30),
  regdate         timestamptz  default now(),
  moduser         varchar(30),
  moddate         timestamptz
);

-- 6. Validaciones previas a operar (coleccion trade_validations)
create table if not exists public.zt_trade_validations (
  id              varchar(24)  primary key,
  symbol          varchar(10)  not null,
  wheel_id        varchar(8),
  requested_phase varchar(3)   not null check (requested_phase in ('CSP','CC')),
  date            timestamptz  not null,
  checks          jsonb        not null,
  result          varchar(8)   not null check (result in ('APPROVED','REJECTED')),
  reason          text,
  actived         boolean      not null default true,
  deleted         boolean      not null default false,
  detail_row_reg  jsonb        not null default '[]'::jsonb,
  reguser         varchar(30),
  regdate         timestamptz  default now(),
  moduser         varchar(30),
  moddate         timestamptz
);

-- Indices para los filtros de las APIs GET
create index if not exists ix_zt_active_wheels_symbol    on public.zt_active_wheels (symbol);
create index if not exists ix_zt_market_analysis_symbol  on public.zt_market_analysis (symbol, date);
create index if not exists ix_zt_news_sentiment_symbol   on public.zt_news_sentiment (symbol, published_at);
create index if not exists ix_zt_trade_validations_sym   on public.zt_trade_validations (symbol, date);

-- Seguridad: RLS activo sin politicas publicas; la API usa la llave secreta
-- del servidor, que si tiene permiso para leer y escribir.
alter table public.zt_active_wheels     enable row level security;
alter table public.zt_market_analysis   enable row level security;
alter table public.zt_market_indices    enable row level security;
alter table public.zt_news_sentiment    enable row level security;
alter table public.zt_wheel_config      enable row level security;
alter table public.zt_trade_validations enable row level security;
