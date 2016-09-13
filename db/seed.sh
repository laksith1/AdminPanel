#!/usr/bin/env bash
mongoimport --db mysensors --collection users --file ./users.json --jsonArray
mongoimport --db mysensors --collection adminDb --file ./adminDb.json --jsonArray
