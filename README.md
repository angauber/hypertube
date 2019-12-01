# Hypertube

Hypertube is a video streaming platform based on [node](https://nodejs.org/en/).\
It uses the p2p bittorrent protocol to fetch Movies and Tv shows on server-side

![Demo](data/demo.gif)

## Requirements
    Node
    Npm
    Mongodb

## Installation

Clone the repo then use the package manager [npm](https://www.npmjs.com/get-npm) to install dependencies.

```bash
git clone https://github.com/angauber/hypertube.git
npm install ./
```

## Usage
You need to setup your .env file with the keys listed in .env.exemple
The oauth api keys are not mendatory.

You can then launch the app using
```bash
node app.js
```
Your app is now accessible via
```bash
http://http://localhost:8008
```
