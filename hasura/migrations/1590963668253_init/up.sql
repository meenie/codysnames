CREATE TABLE public.games (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    turn text,
    blue_has_extra_guess boolean DEFAULT false NOT NULL,
    red_has_extra_guess boolean DEFAULT false NOT NULL,
    number_of_guesses integer DEFAULT '-1'::integer NOT NULL,
    who_won text,
    clue text,
    double_agent text,
    status text DEFAULT 'open'::text NOT NULL
);
CREATE TABLE public.players (
    id text NOT NULL,
    name text,
    current_game_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE FUNCTION public.game_agents(game_row public.games, color text) RETURNS SETOF public.players
    LANGUAGE sql STABLE
    AS $$
  SELECT p.*
  FROM players p
  join games_players gp on gp.player_id = p.id
  WHERE
    gp.game_id = game_row.id
    and gp.color = color
$$;
CREATE FUNCTION public.game_blue_agents(game_row public.games) RETURNS SETOF public.players
    LANGUAGE sql STABLE
    AS $$
  SELECT p.*
  FROM players p
  join games_players gp on gp.player_id = p.id
  WHERE
    gp.game_id = game_row.id
    and gp.color = 'blue'
    and gp.is_spymaster = 'f'
$$;
CREATE FUNCTION public.game_blue_spymaster(game_row public.games) RETURNS json
    LANGUAGE sql STABLE
    AS $$
  with tmp as (
    select p.id, p.name 
    FROM players p
    join games_players gp on gp.player_id = p.id
    WHERE
      gp.game_id = game_row.id
      and gp.color = 'blue'
      and gp.is_spymaster = 't'
  )
  SELECT row_to_json(t) from tmp t
$$;
CREATE FUNCTION public.game_red_agents(game_row public.games) RETURNS SETOF public.players
    LANGUAGE sql STABLE
    AS $$
  SELECT p.*
  FROM players p
  join games_players gp on gp.player_id = p.id
  WHERE
    gp.game_id = game_row.id
    and gp.color = 'red'
    and gp.is_spymaster = 'f'
$$;
CREATE FUNCTION public.game_red_spymaster(game_row public.games) RETURNS json
    LANGUAGE sql STABLE
    AS $$
  with tmp as (
    select p.id, p.name 
    FROM players p
    join games_players gp on gp.player_id = p.id
    WHERE
      gp.game_id = game_row.id
      and gp.color = 'red'
      and gp.is_spymaster = 't'
  )
  SELECT row_to_json(t) from tmp t
$$;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE FUNCTION public.unique_short_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
 -- Declare the variables we'll be using.
DECLARE
  key TEXT;
  qry TEXT;
  found TEXT;
BEGIN
  -- generate the first part of a query as a string with safely
  -- escaped table name, using || to concat the parts
  qry := 'SELECT id FROM ' || quote_ident(TG_TABLE_NAME) || ' WHERE id=';
  -- This loop will probably only run once per call until we've generated
  -- millions of ids.
  LOOP
    -- Generate our string bytes and re-encode as a base64 string.
    key := encode(gen_random_bytes(6), 'base64');
    -- Base64 encoding contains 2 URL unsafe characters by default.
    -- The URL-safe version has these replacements.
    key := replace(key, '/', 'a'); -- url safe replacement
    key := replace(key, '+', 'b'); -- url safe replacement
    key := replace(key, '=', ''); -- url safe replacement
    key := substring(key, 1, 4); -- Make it 4 characters long
    key := upper(key);
    -- Concat the generated key (safely quoted) with the generated query
    -- and run it.
    -- SELECT id FROM "test" WHERE id='blahblah' INTO found
    -- Now "found" will be the duplicated id or NULL.
    EXECUTE qry || quote_literal(key) INTO found;
    -- Check to see if found is NULL.
    -- If we checked to see if found = NULL it would always be FALSE
    -- because (NULL = NULL) is always FALSE.
    IF found IS NULL THEN
      -- If we didn't find a collision then leave the LOOP.
      EXIT;
    END IF;
    -- We haven't EXITed yet, so return to the top of the LOOP
    -- and try again.
  END LOOP;
  -- NEW and OLD are available in TRIGGER PROCEDURES.
  -- NEW is the mutated row that will actually be INSERTed.
  -- We're replacing id, regardless of what it was before
  -- with our key variable.
  NEW.id = key;
  -- The RECORD returned here is what will actually be INSERTed,
  -- or what the next trigger will get if there is one.
  RETURN NEW;
END;
$$;
CREATE TABLE public.card_types (
    value text NOT NULL,
    comment text NOT NULL
);
CREATE TABLE public.game_card_states (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    game_id text NOT NULL,
    flipped boolean DEFAULT false NOT NULL,
    type text NOT NULL,
    who_flipped_it text
);
CREATE TABLE public.game_cards (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    game_id text NOT NULL,
    name text NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    game_card_state_id uuid
);
CREATE TABLE public.game_clues (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    clue text NOT NULL,
    number_of_guesses integer NOT NULL,
    color text NOT NULL,
    game_id text NOT NULL
);
CREATE TABLE public.game_statuses (
    value text NOT NULL,
    comment text NOT NULL
);
CREATE TABLE public.games_players (
    game_id text NOT NULL,
    player_id text NOT NULL,
    color text NOT NULL,
    is_spymaster boolean DEFAULT false NOT NULL
);
CREATE TABLE public.player_colors (
    value text NOT NULL,
    comment text NOT NULL
);
ALTER TABLE ONLY public.card_types
    ADD CONSTRAINT card_types_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.game_card_states
    ADD CONSTRAINT game_card_states_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.game_cards
    ADD CONSTRAINT game_cards_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.game_clues
    ADD CONSTRAINT game_clues_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.game_statuses
    ADD CONSTRAINT game_statuses_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_id_key UNIQUE (id);
ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.games_players
    ADD CONSTRAINT games_players_game_id_player_id_key UNIQUE (game_id, player_id);
ALTER TABLE ONLY public.games_players
    ADD CONSTRAINT games_players_pkey PRIMARY KEY (game_id, player_id);
ALTER TABLE ONLY public.player_colors
    ADD CONSTRAINT player_colors_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_id_key UNIQUE (id);
ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);
CREATE TRIGGER set_public_game_card_states_updated_at BEFORE UPDATE ON public.game_card_states FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_game_card_states_updated_at ON public.game_card_states IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_game_cards_updated_at BEFORE UPDATE ON public.game_cards FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_game_cards_updated_at ON public.game_cards IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_game_clues_updated_at BEFORE UPDATE ON public.game_clues FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_game_clues_updated_at ON public.game_clues IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_games_updated_at ON public.games IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_players_updated_at ON public.players IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER trigger_games_genid BEFORE INSERT ON public.games FOR EACH ROW EXECUTE FUNCTION public.unique_short_id();
ALTER TABLE ONLY public.game_card_states
    ADD CONSTRAINT game_card_states_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.game_card_states
    ADD CONSTRAINT game_card_states_type_fkey FOREIGN KEY (type) REFERENCES public.card_types(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.game_card_states
    ADD CONSTRAINT game_card_states_who_flipped_it_fkey FOREIGN KEY (who_flipped_it) REFERENCES public.players(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.game_cards
    ADD CONSTRAINT game_cards_game_card_state_id_fkey FOREIGN KEY (game_card_state_id) REFERENCES public.game_card_states(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.game_cards
    ADD CONSTRAINT game_cards_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.game_clues
    ADD CONSTRAINT game_clues_color_fkey FOREIGN KEY (color) REFERENCES public.player_colors(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.game_clues
    ADD CONSTRAINT game_clues_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_double_agent_fkey FOREIGN KEY (double_agent) REFERENCES public.player_colors(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.games_players
    ADD CONSTRAINT games_players_color_fkey FOREIGN KEY (color) REFERENCES public.player_colors(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.games_players
    ADD CONSTRAINT games_players_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.games_players
    ADD CONSTRAINT games_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);
ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_status_fkey FOREIGN KEY (status) REFERENCES public.game_statuses(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_turn_fkey FOREIGN KEY (turn) REFERENCES public.player_colors(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_who_won_fkey FOREIGN KEY (who_won) REFERENCES public.player_colors(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
