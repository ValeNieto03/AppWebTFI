--
-- PostgreSQL database dump
--

\restrict G02O8b4dUPjP70yleRnxjYRHv6R5lf7sBtduQ8bihF3ze81ckEXG9elVj5P9AUd

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: reservas_estado_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reservas_estado_enum AS ENUM (
    'ACTIVO',
    'ATENDIDO',
    'AUSENTE',
    'CANCELADO'
);


--
-- Name: usuarios_estado_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.usuarios_estado_enum AS ENUM (
    'ACTIVO',
    'BAJA'
);


--
-- Name: usuarios_rol_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.usuarios_rol_enum AS ENUM (
    'MEDICO',
    'PACIENTE',
    'ADMINISTRADOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: medicos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medicos (
    id integer NOT NULL,
    id_usuario integer NOT NULL,
    matricula integer NOT NULL,
    valor_consulta integer NOT NULL
);


--
-- Name: medicos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.medicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: medicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.medicos_id_seq OWNED BY public.medicos.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: reservas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservas (
    id integer NOT NULL,
    id_medico integer NOT NULL,
    id_paciente integer NOT NULL,
    fecha_hora timestamp without time zone NOT NULL,
    estado public.reservas_estado_enum NOT NULL,
    valor_consulta integer NOT NULL
);


--
-- Name: reservas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reservas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reservas_id_seq OWNED BY public.reservas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    documento text NOT NULL,
    apellidos text NOT NULL,
    nombres text NOT NULL,
    email text NOT NULL,
    clave text NOT NULL,
    estado public.usuarios_estado_enum NOT NULL,
    rol public.usuarios_rol_enum NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: medicos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicos ALTER COLUMN id SET DEFAULT nextval('public.medicos_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: reservas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas ALTER COLUMN id SET DEFAULT nextval('public.reservas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: medicos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medicos (id, id_usuario, matricula, valor_consulta) FROM stdin;
1	1	12345	7000
2	8	23456	9000
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1789220000000	EsquemaClinica1789220000000
\.


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservas (id, id_medico, id_paciente, fecha_hora, estado, valor_consulta) FROM stdin;
1	1	2	2026-09-22 10:00:00	CANCELADO	5000
2	1	2	2026-09-23 11:00:00	ATENDIDO	5000
3	1	2	2026-09-24 09:00:00	ACTIVO	7000
4	1	2	2026-10-18 14:00:00	ACTIVO	7000
5	1	2	2026-10-19 10:00:00	CANCELADO	7000
6	1	2	2026-10-19 10:00:00	ACTIVO	7000
7	1	2	2026-10-27 15:00:00	AUSENTE	7000
8	1	2	2026-10-27 14:00:00	CANCELADO	7000
9	1	2	2026-10-28 10:00:00	CANCELADO	7000
10	1	2	2026-10-28 11:00:00	ACTIVO	8000
11	1	2	2026-10-29 09:00:00	ATENDIDO	7000
12	1	2	2026-10-29 10:00:00	AUSENTE	7000
13	2	2	2026-10-29 09:00:00	ACTIVO	9000
14	2	2	2026-10-30 11:00:00	ACTIVO	9000
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, documento, apellidos, nombres, email, clave, estado, rol) FROM stdin;
1	1001	Perez	Juan	medico1@clinica.com	$2b$10$jA9EiC42icuYYNQYb52GouKEBV6qihB1V1tQo25q3Qy447.3dyIzK	ACTIVO	MEDICO
2	1002	Gomez	Ana	paciente1@clinica.com	$2b$10$jA9EiC42icuYYNQYb52GouKEBV6qihB1V1tQo25q3Qy447.3dyIzK	ACTIVO	PACIENTE
3	1003	Lopez	Carla	admin1@clinica.com	$2b$10$jA9EiC42icuYYNQYb52GouKEBV6qihB1V1tQo25q3Qy447.3dyIzK	ACTIVO	ADMINISTRADOR
4	1004	Baja	Pedro	baja1@clinica.com	$2b$10$jA9EiC42icuYYNQYb52GouKEBV6qihB1V1tQo25q3Qy447.3dyIzK	BAJA	PACIENTE
8	1005	Fernandez	Laura	medico2@clinica.com	$2b$10$jA9EiC42icuYYNQYb52GouKEBV6qihB1V1tQo25q3Qy447.3dyIzK	ACTIVO	MEDICO
\.


--
-- Name: medicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.medicos_id_seq', 2, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- Name: reservas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reservas_id_seq', 14, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 8, true);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: medicos PK_medicos; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT "PK_medicos" PRIMARY KEY (id);


--
-- Name: reservas PK_reservas; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "PK_reservas" PRIMARY KEY (id);


--
-- Name: usuarios PK_usuarios; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_usuarios" PRIMARY KEY (id);


--
-- Name: medicos UQ_medicos_usuario; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT "UQ_medicos_usuario" UNIQUE (id_usuario);


--
-- Name: usuarios UQ_usuarios_documento; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_usuarios_documento" UNIQUE (documento);


--
-- Name: UQ_reservas_medico_fecha_activa; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_reservas_medico_fecha_activa" ON public.reservas USING btree (id_medico, fecha_hora) WHERE (estado = 'ACTIVO'::public.reservas_estado_enum);


--
-- Name: medicos FK_medicos_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT "FK_medicos_usuario" FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);


--
-- Name: reservas FK_reservas_medico; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "FK_reservas_medico" FOREIGN KEY (id_medico) REFERENCES public.medicos(id);


--
-- Name: reservas FK_reservas_paciente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "FK_reservas_paciente" FOREIGN KEY (id_paciente) REFERENCES public.usuarios(id);


--
-- PostgreSQL database dump complete
--

\unrestrict G02O8b4dUPjP70yleRnxjYRHv6R5lf7sBtduQ8bihF3ze81ckEXG9elVj5P9AUd

