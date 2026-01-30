# Käyttäjien Hallintajärjestelmä

## Teknologiat

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Tietokanta**: SQLite
- **Autentikointi**: JWT + bcrypt


### Asennus

repositoriossa on database.db mukana että olisi helpompi testata sovellusta.
sisältää valmiita käyttäjiä ja admin login

1. Kloonaa repositorio: git clone https://github.com/DahlJonathan/Kayttajien-hallintajarjestelma.git
2. Siirry **Käyttäjien-hallintajarjestelma** kansioon
3. Aja nämä komennot terminaalissa:

```
npm install
cd backend
npm install
```

### Käynnistys

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

### kirjaudu sisään:

käyttäjätunnus: admin
salasana: admin

siniseltä valikosta voi valita jos hakee:
  - kaikki käyttäjät
  - nimellä
  - id perusteella

kun hakee kaikki käyttäjät niin tekstikenttä on poistettu käytöstä ja voi hakea kaikki painamalla hae.
kun hakee nimellä niin voi kirjoittaa osittain nimeä tai koko nimeä tekstikenttään ja hakea painamalla hae.
jos hakee id perusteella niin kirjoittaa vain id (numero) ja hakea painamalla hae. id ei voi olla 0 tai negatiivinen.

### Lisää käyttäjä

kun painat lisää käyttäjä niin avautuu valikko missä voit laittaa käyttäjän nimi ja sähköposti

### muokkaa käyttäjää

valitse muokkaa nappi sen käyttäjän kohdalla mikä haluat muokata.
käyttäjän kohdalla avautuu 2 kenttää missä voit muokata nimi ja sähköposti.

## SQLite

sovellus käyttää SQLite ja sisältää valmiina käyttäjiä testaamista varten.

### tietokannan käyttö

Kirjoita terminaaliin komento

```
cd backend
sqlite3 database.db
```
Tämä avaa SQLite-kehotteen sqlite>

### kommennot

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

### admin 

jos poistaa tietokanta (`backend/database.db`) niin joutuu itse laittaa uusi admin käyttäjä admins taulukkoon
käynnistä ja sammuta backend niin se luo users/admins taulukot uudestaan

ajaa terminaalissa
```
cd backend
node -e "const bcrypt=require('bcrypt'); bcrypt.hash('admin', 12).then(h=>console.log(h))"
```

Kopioi hash esim. $2b$12$fsgfddhhghjhfkfuyhsh.

avaa tietokanta
```
sqlite3 database.db
```

lisää käyttäjä admins taulukkoon
```
INSERT INTO admins (username, password_hash)
VALUES ('admin', 'KOPIOITU_HASH_TÄHÄN');
```

poistu tietokannasta
```
.quit
```

nyt on uusi admin asetettu käyttäjänimellä admin ja salasanalla admin.





