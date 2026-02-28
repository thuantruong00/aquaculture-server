cms-project
├── bin                     //=====================
├── config
|   ├── config.json         //
├── core
|   ├── controllers
|   ├── hook
|   ├── migration
│   ├── models
│   │   └── User.js
│   ├── response
│   ├── services       
│   ├── data-source.js      // data source and all connection configuration
├── docs
├── node_modules            //=====================
├── public
|   ├── assets              // font,...
|   ├── images
|   ├── script
|   ├── style
├── routes
|   ├── cms
|   |   ├── index.js
|   ├── website
|   |   ├── index.js
|   ├── index.js
├── views
|   ├── cms
|   ├── website
├── .dockerignore
├── .env
├── .gitignore
├── app.js                  // main
├── Dockerfile
├── package-lock.json       //=====================
├── package.json            // node module dependencies
├── README.md               // simple readme file
└── *

docker save -o docker-images/iot-platform-1.0.3 iot-platform:1.0.3
docker load -i docker-images/iot-platform-1.0.3.tar

docker build -f Dockerfile.prod -t edgeon:prod .

Commands (simple)
1. Build dist (TypeScript -> dist):
   npm run build

2. Run app from dist (local):
   npm run start

3. Build Docker dev image (runs tsx):
   docker build -f Dockerfile -t edgeon:dev .

4. Build Docker prod image (uses dist + data):
   docker build -f Dockerfile.prod -t edgeon:prod .

Notes
- Dockerfile.prod expects prebuilt dist and copies data/ into the image.
- Runtime reads data from /app/data in the container.
