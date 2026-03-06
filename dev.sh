npm i ; cd app ; npm i ; cd .. ;

cd app
npm run build
cd ..

node server.js .env.development.local --watch
