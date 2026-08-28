# API rough sketch

## 1.1 skapa låt

auth: admin
POST /songs

body:
CreateSongRequest
{
title: "Song Title"
}

201:
SongResponse
{
id
title
}

401 Unauthorized
{
error
}

## 1.2 visa låtbibliotek

GET /songs

200:
SongResponse[]
{
id
title
}[]

inkluderar endast archived_at: NULL

GET /songs?archived=true

inkluderar alla

200:
response
{
id
title
}[]

## 1.3 söka efter låt

GET /songs?search=

200:
response
{
id
title
}[]

404 Not Found

GET /songs/{id}

200:
response
{
id
title
}

404 Not Found

## 1.4 lägga till låt utan noter

Samma som 1.1 -  lägga till noter är en annan endpoint

## 1.5 Redigera låt

PATCH /songs/{id}
body
{
id
title: "New Title"
}

songResponse

## 1.6 Arkivera låt

PATCH /songs/{id}
body
{
archived: true
}
servern sätter archived_at till NOW()

SongArchivedResponse
{
id
archived_at
}

---

## 2.1 Massuppladdning

Steg 1, enskilda

skapa part

```yml
POST /songs/{id}/parts
body {
  name: Part Name
}
```

201:
PartResponse
{
  "id": 42,
  "name": "Violin 1"
}

skapa flera parts (kanske inte behövs specialiserade endpoints, vi får se)

ladda upp en fil

`POST /parts/{part_id}/versions`

auth: admin

multipart/form-data:
file: PDF

PartVersionResponse
201:
{
    id: 146
    filename: "Violin_1.pdf"
    published_at: null
}

`POST /parts/{part_id}/versions/{version_id}/publish`

200:
{
    id: 146
    filename: "Violin_1.pdf"
    published_at: date.now()
}

401 Unauthorized
404 Not Found

## 2.2 Förhandsgranska uppladdning

## 2.3 Föreslå instrument utifrån filnamn

## 2.4 Ändra instrumentkoppling vid uppladdning

`POST /parts/{part_id}/instruments`

CreatePartInstrumentRequest

```yml
body:
{
    instrument_id
}
```

`DELETE /parts/{part_id}/instruments/{instrument_id}`

GET /instruments

auth: admin
POST /instruments

CreateInstrumentRequest
body:
name string

201:
InstrumentResponse
{
id
name
}

401 Unauthorized
{
error
}

## 2.5 Koppla not till flera instrument

samma som 2.4 en part kan kopplas till flera instrument

## 2.6 Lämna not utan instrumentspecificering

kräver ingen åtgärd  (bara att kopplingen part-instrument är frivillig)

## 2.7 Ändra instrumentkoppling

samma som 2.4

## 2.8 Visa aktuella noter

`GET /parts/{part_id}/file`

200 OK
Content-Type: application/pdf

`<PDF binary data>`

Returnerar filen för aktuell version.
Aktuell version = senast publicerade version.

## 2.9 Visa alla noter

`GET /parts/{part_id}/versions`

PartVersionResponse[]

[
  {
    "id": "146",
    "filename": "Violin_1.pdf",
    "published_at": "2026-08-27T10:30:00Z"
  },
  {
    "id": "121",
    "filename": "Violin_1_old.pdf",
    "published_at": "2026-08-12T14:20:00Z"
  }
]

auth: admin
Returnerar versionshistorik.

`GET /parts/{part_id}/versions/{version_id}/file`

auth: admin
Returnerar filen för en specifik version.

## 2.X Motsvarande operationer för score

```yml
POST /songs/{id}/score
POST /scores/{score_id}/versions
POST /scores/{score_id}/versions/{version_id}/publish

GET /scores/{score_id}/file
GET /scores/{score_id}/versions
GET /scores/{score_id}/versions/{version_id}/file
```

## 3.1 Skapa spelning

auth: admin
`POST /concerts`

CreateConcertRequest
body
{
name
date
}

201:
ConcertResponse
{
id
name
date
}

400:

missing name or date
malformed json

401:
unauthorized

Ändra namn eller datum på spelning

`PATCH  /concerts/{id}`
UpdateConcertRequest
body
{
name
date
}

## 3.2 Lägga till låtar i spelning

auth: admin
`POST /concerts/{concert_id}/songs`

AddSongToConcertRequest
body
{
  song_id
}

SongResponse
201:
{
id
title
}

## 3.3 Ta bort låt från spelning

auth: admin
`DELETE /concerts/{concert_id}/songs/{song_id}`

## 3.4 Visa låtlista för spelning

GET /concerts

ConcertResponse[]
200:
{
id
name
date
}[]

GET /concerts/{id}

ConcertResponse
200:
{
  "id": 17,
  "name": "Sommarkonsert",
  "date": "2026-09-15"
}

GET /concerts/{id}/songs

200:
SongResponse[]
[
  {
    "id": 42,
    "title": "Super Song"
  },
  {
    "id": 43,
    "title": "Another Song"
  }
]

## 3.5 Visa noter för spelning

GET /concerts/{id}/parts

GET /concerts/{id}/parts

ConcertPartResponse[]
200:
[
  {
    id
    song_id
    song_title
    name
    file: FileResponse
  }
]

file är null om aktuell not saknas.

FileResponse
"file": {
  "id": 83,
  "filename": "Violin_1.pdf"
}

## 3.6 Filtrera spelning efter instrument

GET /concerts/{id}/parts?instrument_id=3

ConcertPartResponse[]
200:
[
  {
    id
    song_id
    song_title
    name
    file
  }
]

## 3.8 Visa saknade noter

## 3.9 Identifiera saknat material

## Security

```yaml
components:
  securitySchemes:

    adminAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

    libraryAccess:
      type: apiKey
      in: query
      name: access_token

GET /songs:
  security:
    - libraryAccess: []
    
POST /songs:
  security:
    - adminAuth: []
```
