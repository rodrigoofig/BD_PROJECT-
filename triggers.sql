CREATE OR REPLACE FUNCTION insert_notifs_cart() RETURNS TRIGGER AS
$BODY$
BEGIN
    INSERT INTO notifs(notifs, users_username) VALUES ('New Cart Created!', NEW.users_username);
      INSERT INTO cart_notifs(notifs_id, cart_cart_id) VALUES (currval('notifs_id_seq'), NEW.cart_id);
      RETURN NEW;
END;
$BODY$
language plpgsql;

CREATE or replace TRIGGER trigger_notifs_cart
     AFTER INSERT ON cart
     FOR EACH ROW
     EXECUTE PROCEDURE insert_notifs_cart();

-- trigger notification threads
CREATE OR REPLACE FUNCTION insert_notifs_pergunta() RETURNS TRIGGER AS
$BODY$
BEGIN
      INSERT INTO notifs(notifs, users_username) VALUES ('New Question!', NEW.users_username);
      INSERT INTO notifs_perguntas (notifs_id, perguntas_pergunta_id ) VALUES (currval('notifs_id_seq'), NEW.pergunta_id);
      
      RETURN NEW;
END;
$BODY$
language plpgsql;

CREATE or replace TRIGGER trigger_notifs_pergunta
     AFTER INSERT ON perguntas
     FOR EACH ROW
     EXECUTE PROCEDURE insert_notifs_pergunta();
     
-- trigger notification replies
CREATE OR REPLACE FUNCTION insert_notifs_resposta() RETURNS TRIGGER AS
$BODY$
BEGIN
          INSERT INTO notifs(notifs, users_username) VALUES ('New Reply!', NEW.users_username);
      INSERT INTO notifs_respostas(notifs_id, respostas_resposta_id) VALUES (currval('notifs_id_seq'), NEW.resposta_id );
      
      RETURN NEW;
END;
$BODY$
language plpgsql;

CREATE or replace TRIGGER trigger_notifs_resposta
     AFTER INSERT ON respostas
     FOR EACH ROW
     EXECUTE PROCEDURE insert_notifs_resposta();
