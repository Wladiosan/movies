# movies

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