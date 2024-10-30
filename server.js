/***************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca 
Academic Policy. No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students.

Name: Jay Dilipbhai Bakaraniya 
Student ID: 143370237
Date: 2024-10-26
Replit Web App URL: https://replit.com/@jdbakaraniya/web322-app
GitHub Repository URL: https://github.com/jaybakaraniya3/web322-app

****************************/


const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const express = require('express');
const path = require('path');
const storeService = require('./store-service');

const app = express();
const upload = multer();

cloudinary.config({
    cloud_name: 'dzqoki4u4',
    api_key: '122297413298853',
    api_secret: 'GUAsQKOPNnIHefuzV5shxFUcSbs',
    secure: true
});

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

storeService.initialize()
    .then(() => {
        app.get('/shop', (req, res) => {
            storeService.getPublishedItems()
                .then(data => res.json(data)) 
                .catch(err => res.status(500).json({ message: err }));
        });

        app.get('/items', (req, res) => {
            const { category, minDate } = req.query;
            if (category) {
                storeService.getItemsByCategory(category)
                    .then(items => res.json(items))
                    .catch(err => res.status(500).json({ message: err }));
            } else if (minDate) {
                storeService.getItemsByMinDate(minDate)
                    .then(items => res.json(items))
                    .catch(err => res.status(500).json({ message: err }));
            } else {
                storeService.getAllItems()
                    .then(items => res.json(items))
                    .catch(err => res.status(500).json({ message: err }));
            }
        });

        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then(data => res.json(data))  
                .catch(err => res.status(500).json({ message: err }));
        });

        app.get('/item/:id', (req, res) => {
            storeService.getItemById(parseInt(req.params.id))
                .then(item => res.json(item))
                .catch(err => res.status(404).json({ message: err }));
        });

        app.get('/items/add', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'addItem.html')); 
        });

        app.post('/items/add', upload.single('featureImage'), (req, res) => {
            let processItem = (imageUrl) => {
                req.body.featureImage = imageUrl;
        
                storeService.addItem(req.body)
                    .then(() => res.redirect('/items'))
                    .catch(err => res.status(500).send("Error: " + err));
            };

            if (req.file) {
                let streamUpload = (req) => {
                    return new Promise((resolve, reject) => {
                        let stream = cloudinary.uploader.upload_stream(
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        streamifier.createReadStream(req.file.buffer).pipe(stream);
                    });
                };

                async function upload(req) {
                    let result = await streamUpload(req);
                    return result;
                }

                upload(req).then((uploaded) => {
                    processItem(uploaded.url);
                }).catch((err) => {
                    console.error("Image upload failed:", err);
                    res.status(500).send("Image upload failed");
                });
            } else {
                processItem("");
            }
        });

        app.delete('/delete-item/:id', (req, res) => {
            const id = parseInt(req.params.id);
            storeService.deleteItemById(id)
                .then(() => res.json({ message: 'Item deleted successfully.' }))
                .catch(err => res.status(404).json({ message: err }));
        });

        app.get('*', (req, res) => {
            res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
        });

        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Error initializing data: ${err}`); 
    });