# Orchestra Sheet Music Library

## Product Description & Requirements Specification — v0.1

## 1. Background

The orchestra’s sheet music is currently managed primarily through shared folders, such as Google Drive.

This works for basic file sharing but creates problems when:

- multiple versions of the same sheet music exist
- it is unclear which version is current
- the material needs to be organized for a specific concert
- new songs are added but sheet music is not yet available

The purpose of the system is to make it easy for administrators to manage sheet music and easy for musicians to find the correct sheet music for a concert.

## 2. Product Principles

### Simplicity Over Functionality

The system must be easy for the musicians to use, at least as easy as the current Drive-based solution. A musician should not need to create an account, remember a password or install any software. The system must also be easy to use for the administrators.

### The System Should Solve a Real Problem

The system should not attempt to replace all existing file management. Its primary purpose is to answer: **Which sheet music is current, and which sheet music should be used for this concert?**

---

## 3. Users

### Musicians

Musicians need to be able to:

- access the system through a shared access link
- view upcoming concerts
- open a concert
- view the songs in the concert
- open/download the current sheet music
- see if sheet music is missing
- see if the material has been updated

Musicians do not have individual user profiles in the MVP.

The primary use case is:

1. Open the link
2. Select an instrument
3. Select a concert
4. Download sheet music

### Administrators

The administrators needs to be able to:

- log in to the administration interface
- create/edit concerts
- create/edit songs
- add sheet music
- replace the current sheet music version
- add songs for which sheet music is not yet available
- select which songs are included in a concert
- add/remove instruments and connect them to parts

## 4. MVP

The MVP includes:

- song library
- current and alternative sheet music versions
- instruments as metadata
- concerts and setlists
- songs with missing sheet music
- administration interface
- musician access via a shared link
- protected PDF files
- mobile-friendly interface

## 5. Outside the MVP

The following features are not planned for the first version:

- personal annotated sheet music
- approval of musician uploads
- advanced version history
- individual user accounts
