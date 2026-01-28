### Käyttäjien Hallintajärjestelmä

## Asennus

1. Kloonaa repositorio: git clone https://github.com/DahlJonathan/Kayttajien-hallintajarjestelma.git
2. Siirry **Käyttäjien-hallintajarjestelma** kansioon
3. Aja nämä komennot terminaalissa:

```
npm install
cd backend
npm install
```

## Käynnistys

Sovellus vaatii kaksi erillistä terminaalia:

**Terminaali 1 - Backend:**
```
cd backend
node server.js
```

**Terminaali 2 - Frontend:**

```
npm run dev
```

Backend käynnistyy osoitteeseen `http://localhost:3000` ja frontend osoitteeseen `http://localhost:5173`.

## Käyttö

siniseltä valikosta voi valita jos hakee:
  - kaikki käyttäjät
  - nimellä
  - id perusteella

kun hakee kaikki käyttäjät niin tekstikenttä on poistettu käytöstä ja voi hakea kaikki painamalla hae.
kun hakee nimellä niin voi kirjoittaa osittain nimeä tai koko nimeä tekstikenttään ja hakea painamalla hae.
jos hakee id perusteella niin kirjoittaa vain id (numero) ja hakea painamalla hae. id ei voi olla 0 tai negatiivinen.

# Lisää käyttäjä

kun painat lisää käyttäjä niin avautuu valikko missä voit laittaa käyttäjän nimi ja sähköposti

# muokkaa käyttäjää

valitse muokkaa nappi sen käyttäjän kohdalla mikä haluat muokata.
käyttäjän alle avautuu 2 kenttää missä voit muokata nimi ja sähköposti.

## SQLite

sovellus käyttää SQLite ja sisältää valmiina käyttäjiä testaamista varten.

# tietokannan käyttö

Kirjoita terminaaliin komento

```
cd backend
sqlite3 database.db
```
Tämä avaa SQLite-kehotteen sqlite>

# komennot

näytä kaikki taulukot:
```
.tables
```

näyttää miten taulukko on rakennettu
```
.schema "taulukkon nimi"  
```

näyttää kaikki rivit taulukost
```
SELECT * FROM taulukon_nimi;
```

voit hakea tiettyjä tietoja taulukosta muuttamalla tähti esim:
```
SELECT name FROM users;
```
tämä näyttää kaikki nimet users taulukosta

voit myös hakea käyttäjä nimi,id tai sähköpostin perusteella:
```
sqlite> SELECT * FROM users WHERE name = 'Otto';
```

poistu
```
.quit
```

