--
-- authors
--

DROP TABLE public.authors;
CREATE TABLE public.authors (
    id integer PRIMARY KEY,
    name text
);

INSERT INTO authors (id, name) VALUES (1, 'J.K. Rowling');
INSERT INTO authors (id, name) VALUES (2, 'Michael Crichton');
INSERT INTO authors (id, name) VALUES (3, 'John Doe');

--
-- books
--
DROP TABLE public.books;
CREATE TABLE public.books (
    id integer PRIMARY KEY,
    title text,
    author_id integer
);

---
--- data
---
INSERT INTO books (author_id, id, title) VALUES (1, 1, 'Harry Potter and the Philosopher’s stonee');
INSERT INTO books (author_id, id, title) VALUES (1, 2, 'Harry Potter and the Chamber of Secrets');
INSERT INTO books (author_id, id, title) VALUES (1, 3, 'Harry Potter and the Chamber of Secrets');
INSERT INTO books (author_id, id, title) VALUES (1, 4, 'Harry Potter and the Prisoner of Azkaban');
INSERT INTO books (author_id, id, title) VALUES (1, 5, 'Harry Potter and the Goblet of Fire');
INSERT INTO books (author_id, id, title) VALUES (1, 6, 'Harry Potter and the Order of the Phoenix');
INSERT INTO books (author_id, id, title) VALUES (1, 7, 'Harry Potter and the Half-Blood Prince');
INSERT INTO books (author_id, id, title) VALUES (1, 9, 'Harry Potter and the Deathly Hallows');
INSERT INTO books (author_id, id, title) VALUES (1, 10, 'Fantastic Beasts and Where to Find Them');
INSERT INTO books (author_id, id, title) VALUES (1, 11, 'Quidditch Through the Ages');
INSERT INTO books (author_id, id, title) VALUES (1, 12, 'The Tales of Beedle the Bard');
INSERT INTO books (author_id, id, title) VALUES (2, 8, 'Jurassic Park');
INSERT INTO books (author_id, id, title) VALUES (0, 13, 'Ghost Author');
