# Notbibliotek för orkester

## Produktbeskrivning & kravspecifikation — v0.1

## 1. Bakgrund

Notmaterialet för orkesterns spelningar hanteras idag huvudsakligen genom delade mappar, exempelvis Google Drive.

Det fungerar för grundläggande fildelning men skapar problem när:

- flera versioner av samma not förekommer
- det är oklart vilken version som är aktuell
- materialet ska organiseras för en specifik spelning
- nya låtar tillkommer men noter ännu saknas

Systemets syfte är att göra det enkelt för administratörer att hålla ordning på notmaterial och enkelt för musiker att hitta rätt noter för en spelning.

## 2. Produktprinciper

### Enkelhet framför funktionalitet

Systemet ska vara minst lika enkelt för musiker att använda som dagens Drive-lösning.

En musiker ska inte behöva:

- skapa konto
- komma ihåg lösenord
- förstå versionshantering
- navigera genom administrativ struktur
- installera någon programvara

Det primära användningsfallet är:

**Öppna länken → välj spelning → öppna/ladda ner noter.**

---

### Administrativ kontroll utan administrativ komplexitet

Administratörer ska kunna:

- skapa spelningar
- skapa och redigera låtar
- ladda upp noter
- ersätta aktuell version
- markera att noter saknas

utan att behöva hantera tekniska detaljer.

### Systemet ska lösa ett verkligt problem

Systemet ska inte försöka ersätta all befintlig filhantering.

Det ska framför allt lösa:

**Vilka noter är aktuella och vilka noter ska användas till den här spelningen?**

## 3. Användare

### Musiker

Musiker behöver kunna:

- öppna systemet via en delad åtkomstlänk
- se kommande spelningar
- öppna en spelning
- se låtarna i spelningen
- öppna/ladda ner aktuell not
- se om noter saknas
- se om materialet har uppdaterats

Musiker har ingen individuell användarprofil i MVP.

### Administratör

Administratören behöver kunna:

- logga in till administrationsgränssnittet
- skapa/redigera spelningar
- skapa/redigera låtar
- lägga till noter
- ersätta aktuell notversion
- markera noter som saknade
- lägga till låtar som ännu saknar noter
- välja vilka låtar som ingår i en spelning

## 4. MVP

MVP:n ska ge administratörer möjlighet att hantera låtar, noter och
spelningar, och ge musiker enkel åtkomst till rätt notmaterial för
en spelning.

MVP:n omfattar:

- låtbibliotek
- aktuella och alternativa notversioner
- instrument som metadata
- spelningar och låtlistor
- låtar som saknar noter
- administratörsgränssnitt
- åtkomst för musiker via delad länk
- skyddade PDF-filer
- mobilanpassat gränssnitt

## 5. Utanför MVP

Följande funktioner planeras inte för den första versionen:

- personliga annoterade noter
- godkännande av musikeruppladdningar
- avancerad versionshistorik
- individuella användarkonton
