/***************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca 
Academic Policy. No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students.

Name: Jay Dilipbhai Bakaraniya 
Student ID: 143370237
Date: 2024-10-25
Replit Web App URL: https://replit.com/@jdbakaraniya/web322-app
GitHub Repository URL: https://github.com/jaybakaraniya3/web322-app

****************************/


const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                return reject(`Unable to read items.json: ${err.message}`);
            }
            items = JSON.parse(data);

            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    return reject(`Unable to read categories.json: ${err.message}`);
                }
                categories = JSON.parse(data);

                resolve();
            });
        });
    });
};

module.exports.getAllItems = function() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject('No results returned');
        } else {
            resolve(items);
        }
    });
};

module.exports.getPublishedItems = function() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            reject('No results returned');
        } else {
            resolve(publishedItems);
        }
    });
};

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject('No results returned');
        } else {
            resolve(categories);
        }
    });
};

module.exports.addItem = function(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;

        items.push(itemData);

        fs.writeFile(path.join(__dirname, 'data', 'items.json'), JSON.stringify(items, null, 2), (err) => {
            if (err) {
                reject('Error saving item: ' + err.message);
            } else {
                resolve(itemData);
            }
        });
    });
};

module.exports.getItemsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === category);
        if (filteredItems.length === 0) {
            reject('No results returned');
        } else {
            resolve(filteredItems);
        }
    });
};

module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);

        if (filteredItems.length === 0) {
            reject('No results returned');
        } else {
            resolve(filteredItems);
        }
    });
};

module.exports.getItemById = function(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === id);
        if (!item) {
            reject('No result returned');
        } else {
            resolve(item);
        }
    });
};

module.exports.deleteItemById = function(id) {
    return new Promise((resolve, reject) => {
        const index = items.findIndex(item => item.id === id);
        if (index === -1) {
            return reject('Item not found');
        }

        items.splice(index, 1);
        fs.writeFile(path.join(__dirname, 'data', 'items.json'), JSON.stringify(items, null, 2), (err) => {
            if (err) {
                reject('Error saving item: ' + err.message);
            } else {
                resolve();
            }
        });
    });
};
