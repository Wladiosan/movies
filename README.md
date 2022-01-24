# movies

GET START:
1. git clone https://github.com/Wladiosan/movies.git
2. npm install
3. npm run start
4. try postman
5. (sorry, without docker, because can not install sqlite package on docker image)

ROUTES:

Users:
 - POST: ( http://localhost:8000/api/v1/users ) - working!

Sessions:
 - POST: ( http://localhost:8000/api/v1/sessions ) - working!

Movies: 
 - POST: ( http://localhost:8000/api/v1/movies ) - working!
 - DEL: ( http://localhost:8000/api/v1/movies/:id ) - working!
 - PATCH: ( http://localhost:8000/api/v1/movies/:id ) - working!
 - GET: ( http://localhost:8000/api/v1/movies/:id ) - working!
 - GET: ( http://localhost:8000/api/v1/movies?sort=year&order=DESC&limit=10&offset=0 ) - working!
 - POST: ( http://localhost:8000/api/v1/movies/import ) - NO working!