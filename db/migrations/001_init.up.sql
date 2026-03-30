CREATE TABLE vietlott_results_45 (
    id SERIAL PRIMARY KEY,
    draw_date DATE NOT NULL,
    number1 SMALLINT NOT NULL, 
    number2 SMALLINT NOT NULL, 
    number3 SMALLINT NOT NULL, 
    number4 SMALLINT NOT NULL, 
    number5 SMALLINT NOT NULL, 
    number6 SMALLINT NOT NULL, 
    draw_numb INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vietlott_results_55 (
    id SERIAL PRIMARY KEY,
    draw_date DATE NOT NULL,
    number1 SMALLINT NOT NULL, 
    number2 SMALLINT NOT NULL, 
    number3 SMALLINT NOT NULL, 
    number4 SMALLINT NOT NULL, 
    number5 SMALLINT NOT NULL, 
    number6 SMALLINT NOT NULL, 
    numberextra SMALLINT NOT NULL, 
    draw_numb INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vietlott_results_35 (
    id SERIAL PRIMARY KEY,
    draw_date DATE NOT NULL,
    number1 SMALLINT NOT NULL, 
    number2 SMALLINT NOT NULL, 
    number3 SMALLINT NOT NULL, 
    number4 SMALLINT NOT NULL, 
    number5 SMALLINT NOT NULL, 
    numberextra SMALLINT NOT NULL, 
    draw_numb INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);