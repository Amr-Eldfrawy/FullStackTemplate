### Project Documentation 
https://docs.google.com/document/d/14aruM1Ez6ZU426Pi6N4JVqllejr4yev5LEn5XCabZFo/edit?usp=sharing
### Tools You Need To Have Locally  
#### mongodb community edition
https://www.mongodb.com/download-center/community
##### mac 
1. install hombrew ```/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"```
2. install mongodb  by following ```Install and Run MongoDB with Homebrew``` in https://treehouse.github.io/installation-guides/mac/mongo-mac.html
3. assert mongo installation ```mongo -version```
4. optional. install mongocompass https://docs.mongodb.com/compass/master/install/
"MongoDB Compass is the GUI for MongoDB. Compass allows you to analyze and understand the contents of your data without formal knowledge of MongoDB query syntax"
#### pipenv
https://docs.pipenv.org/en/latest/install/
##### mac

install pipenv ```brew install pipenv```

####  Node.JS and npm
https://www.npmjs.com/get-npm
##### mac 
1. ```brew update```
2. ```brew install node```  
3. Test Node ```node -v```
4. Test npm ```npm -v```

####  webpack and webpack-cli
1. install webpack globally ```npm install --global webpack```
1. install webpack-cli globally ```npm install --global webpack-cli``` 

### Run Application - Demo

#### 1) Run Mongodb Server
open a terminal tab/shell and run ```mongod``` to run a mongodb local server.
 

#### 2) Add Whitelisted Users (Once)

run the following commands line by line in your shell to add one test account for running tests and another for the demo.
you need this if you did not install mongodb compass. 
```
$ mongo
$ use password_manager_db
$ db.createCollection("whitelisted_users")
$ db.whitelisted_users.insert({name:'test'})
$ db.whitelisted_users.insert({name:'DemoAccount12'})
$ exit
```

if you installed MongoDB Compass you don't have to run such commands, on the other hand  you can use the user interface to create a databse named ```password_manager_db```
with a collection/table named ```whitelisted_users``` with one column named ```name``` .
add 2 users, ``test`` and ``DemoAccount12`` under  ```whitelisted_users```

Also, make sure that database is listening on port 27017 

#### 3) Run Website
open another terminal tab and run the following: 
1. run ```pipenv install``` in the same directory as ```Pipfile```  
2. run ```pipenv shell```
3. route to front-end code ```cd src/static```
4. run ```npm run build ```


#### 4) Run Tests (Optional)

1. run ```pipenv install``` in the same directory as ```Pipfile```  
2. run ```pipenv shell```
3. route to backend code ```cd src/password_manager_service```
4. run ```pytest```
